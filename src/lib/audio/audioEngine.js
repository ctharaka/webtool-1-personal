/**
 * src/lib/audio/audioEngine.js
 * Unified Client-Side Audio Processing Engine for FreeFileTool.
 *
 * Architecture:
 * - 100% browser-side execution (Web Audio API + in-memory encoding)
 * - Zero network uploads, zero backend transcoding
 * - Dynamic import of @breezystack/lamejs on-demand
 * - Pure-JS WAV encoder (zero dependencies)
 * - Non-blocking chunked MP3 encoding with UI progress callbacks
 */

import { audioBufferToWav } from './wavEncoder.js';

/**
 * Decodes an audio File or Blob into an AudioBuffer using browser AudioContext.
 * @param {File | Blob} file
 * @param {(stage: string, percent: number) => void} [onProgress]
 * @returns {Promise<AudioBuffer>}
 */
export async function decodeAudioFile(file, onProgress) {
  if (onProgress) onProgress('Reading audio data...', 10);
  const arrayBuffer = await file.arrayBuffer();

  if (onProgress) onProgress('Decoding audio...', 30);
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioCtxClass();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    if (onProgress) onProgress('Audio decoded successfully', 50);
    return audioBuffer;
  } catch (err) {
    throw new Error(
      'Unable to decode audio format. The browser may not support this file format or codec.'
    );
  } finally {
    if (audioCtx.state !== 'closed') {
      try {
        await audioCtx.close();
      } catch (_) {}
    }
  }
}

/**
 * Encodes an AudioBuffer into a WAV Blob (16-bit PCM).
 * @param {AudioBuffer} audioBuffer
 * @param {(stage: string, percent: number) => void} [onProgress]
 * @returns {Promise<Blob>}
 */
export async function encodeToWav(audioBuffer, onProgress) {
  if (onProgress) onProgress('Encoding WAV format...', 75);
  // Yield to event loop to allow UI updates
  await new Promise((r) => setTimeout(r, 0));
  const wavBlob = audioBufferToWav(audioBuffer);
  if (onProgress) onProgress('WAV encoding complete', 100);
  return wavBlob;
}

/**
 * Encodes an AudioBuffer into an MP3 Blob using dynamically imported lamejs.
 * Processes audio in chunks and yields to the event loop for responsiveness.
 *
 * @param {AudioBuffer} audioBuffer
 * @param {number} [bitrate=192] - Bitrate in kbps (e.g. 64, 128, 192, 320)
 * @param {(stage: string, percent: number) => void} [onProgress]
 * @returns {Promise<Blob>}
 */
export async function encodeToMp3(audioBuffer, bitrate = 192, onProgress) {
  if (onProgress) onProgress('Loading MP3 encoder...', 55);

  const lameModule = await import('@breezystack/lamejs');
  const Mp3Encoder = lameModule.Mp3Encoder || lameModule.default?.Mp3Encoder;

  if (!Mp3Encoder) {
    throw new Error('Failed to initialize client-side MP3 encoder.');
  }

  const channels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const numSamples = audioBuffer.length;
  const encoder = new Mp3Encoder(channels, sampleRate, bitrate);

  // Convert float32 channel samples to 16-bit integer PCM
  const leftFloat = audioBuffer.getChannelData(0);
  const leftInt16 = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, leftFloat[i]));
    leftInt16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  let rightInt16 = null;
  if (channels > 1) {
    const rightFloat = audioBuffer.getChannelData(1);
    rightInt16 = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, rightFloat[i]));
      rightInt16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  }

  const mp3Data = [];
  const chunkSize = 1152 * 8; // 9216 samples per chunk
  let processed = 0;

  while (processed < numSamples) {
    const end = Math.min(processed + chunkSize, numSamples);
    const leftChunk = leftInt16.subarray(processed, end);
    let chunk;

    if (channels === 1) {
      chunk = encoder.encodeBuffer(leftChunk);
    } else {
      const rightChunk = rightInt16.subarray(processed, end);
      chunk = encoder.encodeBuffer(leftChunk, rightChunk);
    }

    if (chunk && chunk.length > 0) {
      mp3Data.push(chunk.buffer ? chunk : new Uint8Array(chunk));
    }

    processed = end;
    if (onProgress) {
      const pct = 60 + Math.round((processed / numSamples) * 35);
      onProgress(`Encoding MP3 (${bitrate} kbps)...`, pct);
    }

    // Yield control to UI thread every few chunks
    if (processed % (chunkSize * 2) === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  const flush = encoder.flush();
  if (flush && flush.length > 0) {
    mp3Data.push(flush.buffer ? flush : new Uint8Array(flush));
  }

  if (onProgress) onProgress('Finalizing MP3 file...', 100);
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Trims an AudioBuffer to a specific start and end time.
 * @param {AudioBuffer} audioBuffer
 * @param {number} startTime - in seconds
 * @param {number} endTime - in seconds
 * @returns {AudioBuffer}
 */
export function trimAudioBuffer(audioBuffer, startTime, endTime) {
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  const validStart = Math.max(0, Math.min(startTime, duration));
  const validEnd = Math.max(validStart, Math.min(endTime, duration));

  const startOffset = Math.floor(validStart * sampleRate);
  const endOffset = Math.floor(validEnd * sampleRate);
  const frameCount = Math.max(1, endOffset - startOffset);

  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtxClass();
  const trimmed = ctx.createBuffer(
    audioBuffer.numberOfChannels,
    frameCount,
    sampleRate
  );

  for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
    const channelData = audioBuffer.getChannelData(c);
    const sliced = channelData.subarray(startOffset, endOffset);
    trimmed.copyToChannel(sliced, c, 0);
  }

  ctx.close().catch(() => {});
  return trimmed;
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS format.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Triggers browser download of a Blob with the given filename and revokes the URL.
 * @param {Blob} blob
 * @param {string} filename
 */
export function triggerAudioDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
