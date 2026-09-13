(() => {
  const canvas1 = document.getElementById('canvas-1');
  const canvas2 = document.getElementById('canvas-2');
  const page2 = document.getElementById('page-2');
  const page2Wrap = page2 ? page2.querySelector('.sticky-wrap') : null;
  const page3 = document.getElementById('page-3');
  const page3Wrap = document.getElementById('page-3-wrap');
  const triangle1 = document.getElementById('triangle-1');
  const triangle2 = document.getElementById('triangle-2');
  const ruleLetters = [
    document.getElementById('rule-letter-0'),
    document.getElementById('rule-letter-1'),
    document.getElementById('rule-letter-2'),
    document.getElementById('rule-letter-3'),
    document.getElementById('rule-letter-4')
  ];
  const ruleCards = [
    document.getElementById('rule-card-1'),
    document.getElementById('rule-card-2'),
    document.getElementById('rule-card-3'),
    document.getElementById('rule-card-4')
  ];
  const page4 = document.getElementById('page-4');
  const page4Wrap = document.getElementById('page-4-wrap');
  const insideFullImg = document.getElementById('inside-full-img');
  const canvas5 = document.getElementById('canvas-5');
  const page5 = document.getElementById('page-5');
  const page5Wrap = page5 ? page5.querySelector('.sticky-wrap') : null;

  // Initialize high-fidelity 4K Display-P3 Wide Gamut 2D Context
  const getContext4K = (canvas) => {
    if (!canvas) return null;
    try {
      return canvas.getContext('2d', {
        colorSpace: 'display-p3',
        alpha: false,
        desynchronized: true
      });
    } catch (e) {
      return canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
  };

  const ctx1 = getContext4K(canvas1);
  const ctx2 = getContext4K(canvas2);
  const ctx5 = getContext4K(canvas5);

  // Initialize Lenis High-Fidelity Physics-Based Smooth Momentum Scroll
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenis.on('scroll', (e) => {
      updateScroll(e.scroll);
    });

    function lenisRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);
  }

  // Phone / Mobile Device Detection (portrait or viewport <= 768px)
  const isMobileDevice = () => {
    return window.innerWidth <= 768 || (window.innerHeight > window.innerWidth && window.innerWidth <= 1024);
  };

  // 180 frames from JH for Desktop Animation 1, 90 frames for Desktop Animation 2
  // 180 portrait frames from JK for Phone Animation 1, 90 portrait frames from FHONE for Phone Animation 2
  // 89 frames from AN 5 for Desktop Animation 5 (READY)
  const FRAME_COUNT_1 = 180;
  const FRAME_COUNT_2 = 90;
  const FRAME_COUNT_MOBILE_1 = 180;
  const FRAME_COUNT_MOBILE_2 = 90;
  const FRAME_COUNT_5 = 89;

  // Detect WebP next-gen format support (92% smaller payload for instant load)
  const supportsWebP = (() => {
    try {
      const elem = document.createElement('canvas');
      return elem.getContext && elem.getContext('2d')
        ? elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
        : false;
    } catch (e) {
      return false;
    }
  })();
  const EXT = supportsWebP ? '.webp' : '.png';

  const frameUrl1 = (i) => `frames1/ezgif-frame-${String(i).padStart(3, '0')}${EXT}`;
  const frameUrl2 = (i) => `frames2/ezgif-frame-${String(i).padStart(3, '0')}${EXT}`;
  const frameUrlMobile1 = (i) => `frames_mobile/ezgif-frame-${String(i).padStart(3, '0')}${EXT}`;
  const frameUrlMobile2 = (i) => `frames_mobile2/ezgif-frame-${String(i).padStart(3, '0')}${EXT}`;
  const frameUrl5 = (i) => `frames5/ezgif-frame-${String(i).padStart(3, '0')}${EXT}`;

  const images1 = new Array(FRAME_COUNT_1);
  const loaded1 = new Array(FRAME_COUNT_1).fill(false);

  const images2 = new Array(FRAME_COUNT_2);
  const loaded2 = new Array(FRAME_COUNT_2).fill(false);

  const imagesMobile1 = new Array(FRAME_COUNT_MOBILE_1);
  const loadedMobile1 = new Array(FRAME_COUNT_MOBILE_1).fill(false);

  const imagesMobile2 = new Array(FRAME_COUNT_MOBILE_2);
  const loadedMobile2 = new Array(FRAME_COUNT_MOBILE_2).fill(false);

  const images5 = new Array(FRAME_COUNT_5);
  const loaded5 = new Array(FRAME_COUNT_5).fill(false);

  // Ultra-responsive LERP factor for instant, zero-lag frame tracking
  const SCROLL_LERP = 0.35;

  // Targets and LERP variables for canvas sequences
  let targetProgress1 = 0;
  let currentProgress1 = 0;
  let lastFrame1 = -1;

  let targetProgress2 = 0;
  let currentProgress2 = 0;
  let lastFrame2 = -1;

  let targetTranslateY2 = 100; // in percent (100% = below, 0% = docked)
  let currentTranslateY2 = 100;

  let targetProgress3 = 0;
  let currentProgress3 = 0;
  let targetTranslateY3 = 100; // in percent (100% = below, 0% = docked)
  let currentTranslateY3 = 100;

  let targetProgress4 = 0;
  let currentProgress4 = 0;
  let targetTranslateY4 = 100; // in percent (100% = below, 0% = docked)
  let currentTranslateY4 = 100;

  let targetProgress5 = 0;
  let currentProgress5 = 0;
  let lastFrame5 = -1;
  let targetTranslateY5 = 100; // in percent (100% = below, 0% = docked)
  let currentTranslateY5 = 100;
  let prevProgress5 = -1;

  // Edge-to-edge screen fill:
  // Sizes the animation to completely cover the screen without cropping or cutting off any part
  function getFrameDims(cWidth, cHeight, isMob = false) {
    return {
      drawWidth: cWidth,
      drawHeight: cHeight,
      offsetX: 0,
      offsetY: 0
    };
  }

  // Gracefully return requested image or nearest loaded neighbor to prevent any flash
  function getLoadedImage(images, loaded, count, index) {
    if (loaded[index] && images[index]) return images[index];
    for (let offset = 1; offset < count; offset++) {
      if (index - offset >= 0 && loaded[index - offset]) return images[index - offset];
      if (index + offset < count && loaded[index + offset]) return images[index + offset];
    }
    return null;
  }

  // Draw pure crystal-clear frames filling the entire viewport edge-to-edge
  function drawFrame1(index) {
    if (!ctx1 || !canvas1) return;
    const isMob = isMobileDevice();
    const imgs = isMob ? imagesMobile1 : images1;
    const lds = isMob ? loadedMobile1 : loaded1;
    const count = isMob ? FRAME_COUNT_MOBILE_1 : FRAME_COUNT_1;

    const img = getLoadedImage(imgs, lds, count, index);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height);
      lastFrame1 = index;
    }
  }

  function drawBlended1(progress) {
    if (!ctx1 || !canvas1) return;
    const count = isMobileDevice() ? FRAME_COUNT_MOBILE_1 : FRAME_COUNT_1;
    const exactFrame = progress * (count - 1);
    const frameIndex = Math.min(count - 1, Math.max(0, Math.round(exactFrame)));

    if (frameIndex === lastFrame1) return;
    drawFrame1(frameIndex);
  }

  function drawFrame2(index) {
    if (!ctx2 || !canvas2) return;
    const isMob = isMobileDevice();
    const imgs = isMob ? imagesMobile2 : images2;
    const lds = isMob ? loadedMobile2 : loaded2;
    const count = isMob ? FRAME_COUNT_MOBILE_2 : FRAME_COUNT_2;

    const img = getLoadedImage(imgs, lds, count, index);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
      lastFrame2 = index;
    }
  }

  function drawBlended2(progress) {
    if (!ctx2 || !canvas2) return;
    const count = isMobileDevice() ? FRAME_COUNT_MOBILE_2 : FRAME_COUNT_2;
    const exactFrame = progress * (count - 1);
    const frameIndex = Math.min(count - 1, Math.max(0, Math.round(exactFrame)));

    if (frameIndex === lastFrame2) return;
    drawFrame2(frameIndex);
  }

  function drawFrame5(index) {
    if (!ctx5 || !canvas5) return;
    const img = getLoadedImage(images5, loaded5, FRAME_COUNT_5, index);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx5.drawImage(img, 0, 0, canvas5.width, canvas5.height);
      lastFrame5 = index;
    }
  }

  function drawBlended5(progress) {
    if (!ctx5 || !canvas5) return;
    const exactFrame = progress * (FRAME_COUNT_5 - 1);
    const frameIndex = Math.min(FRAME_COUNT_5 - 1, Math.max(0, Math.round(exactFrame)));

    if (frameIndex === lastFrame5) return;
    drawFrame5(frameIndex);
  }

  function resizeCanvases() {
    // Hardware-accelerated pixel ratio capped at 1.5 to eliminate GPU fillrate bottlenecks
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas1 && ctx1) {
      canvas1.width = Math.round(width * dpr);
      canvas1.height = Math.round(height * dpr);
      canvas1.style.width = width + 'px';
      canvas1.style.height = height + 'px';
      drawFrame1(lastFrame1 >= 0 ? lastFrame1 : 0);
    }
    if (canvas2 && ctx2) {
      canvas2.width = Math.round(width * dpr);
      canvas2.height = Math.round(height * dpr);
      canvas2.style.width = width + 'px';
      canvas2.style.height = height + 'px';
      drawFrame2(lastFrame2 >= 0 ? lastFrame2 : 0);
    }
    if (canvas5 && ctx5) {
      canvas5.width = Math.round(width * dpr);
      canvas5.height = Math.round(height * dpr);
      canvas5.style.width = width + 'px';
      canvas5.style.height = height + 'px';
      drawFrame5(lastFrame5 >= 0 ? lastFrame5 : 0);
    }
    prevProgress1 = -1;
    prevProgress2 = -1;
    prevProgress5 = -1;
    positionCardOverlay();
  }

  // Calculate pixel-perfect coordinates to place overlay directly beneath the word HOLD
  function positionCardOverlay() {
    const cardOverlay = document.getElementById('card-overlay');
    if (!cardOverlay) return;

    const cWidth = window.innerWidth;
    const cHeight = window.innerHeight;
    const isMob = isMobileDevice();

    if (isMob) {
      // In 1072x1920 mobile portrait frame coordinates:
      // HOLD text left is at X = 42, bottom of HOLD is at Y = 676
      const holdLeft = (42 / 1072) * cWidth;
      const holdBottom = (676 / 1920) * cHeight;
      const clearance = Math.max(14, Math.round(cHeight * 0.015));

      cardOverlay.style.left = `${Math.max(16, Math.round(holdLeft))}px`;
      cardOverlay.style.top = `${Math.round(holdBottom + clearance)}px`;
    } else {
      // In 1920x1080 desktop landscape frame coordinates:
      // HOLD text left is at X = 100, bottom of HOLD is at Y = 465
      const holdLeft = (100 / 1920) * cWidth;
      const holdBottom = (465 / 1080) * cHeight;

      cardOverlay.style.left = `${Math.max(20, Math.round(holdLeft))}px`;
      cardOverlay.style.top = `${Math.round(holdBottom + 18)}px`;
    }
  }

  // Squid Game High-Performance Progressive Staged Streaming Loader
  const progressBar = document.getElementById('loading-progress-bar');
  let loadedKeyframesCount = 0;
  let totalKeyframesCount = 0;

  function updateLoadingBar() {
    if (!progressBar || totalKeyframesCount === 0) return;
    const pct = Math.min(100, Math.round((loadedKeyframesCount / totalKeyframesCount) * 100));
    progressBar.style.width = pct + '%';
    if (pct >= 100) {
      setTimeout(() => {
        progressBar.classList.add('done');
      }, 400);
    }
  }

  // Priority batch queue: prevents network saturation by capping concurrency to 6
  function createBatchQueue(concurrency = 6) {
    let running = 0;
    const queue = [];

    function processNext() {
      while (running < concurrency && queue.length > 0) {
        const task = queue.shift();
        running++;
        const img = new Image();
        img.decoding = 'async';
        if (task.priority) img.fetchPriority = task.priority;
        img.src = task.url;

        const onDone = () => {
          task.onDone(img);
          running--;
          processNext();
        };

        if (img.decode) {
          img.decode().then(onDone).catch(onDone);
        } else {
          img.onload = onDone;
          img.onerror = onDone;
        }
      }
    }

    return {
      push(url, onDone, priority = 'low') {
        queue.push({ url, onDone, priority });
        processNext();
      },
      unshift(url, onDone, priority = 'high') {
        queue.unshift({ url, onDone, priority });
        processNext();
      }
    };
  }

  const batchQueue = createBatchQueue(6);

  function scheduleIntermediateFrames(targetImages, targetLoaded, frameCount, urlFn, stride) {
    const intermediates = [];
    for (let i = 1; i < frameCount; i++) {
      if (i % stride === 0 || i === frameCount - 1 || targetLoaded[i]) continue;
      intermediates.push(i);
    }

    let idx = 0;
    function loadNextBatch() {
      if (idx >= intermediates.length) return;
      const end = Math.min(idx + 4, intermediates.length);
      for (let k = idx; k < end; k++) {
        const frameIdx = intermediates[k];
        batchQueue.push(urlFn(frameIdx + 1), (img) => {
          targetImages[frameIdx] = img;
          targetLoaded[frameIdx] = true;
        }, 'low');
      }
      idx = end;
      if (idx < intermediates.length) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadNextBatch, { timeout: 150 });
        } else {
          setTimeout(loadNextBatch, 60);
        }
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadNextBatch, { timeout: 300 });
    } else {
      setTimeout(loadNextBatch, 100);
    }
  }

  function loadSequenceStaged(targetImages, targetLoaded, frameCount, urlFn, onFirstFrameReady, isHero = false) {
    // Stage 0: Instant Frame 1 with high priority
    if (!targetLoaded[0]) {
      const img0 = new Image();
      img0.fetchPriority = 'high';
      img0.decoding = 'async';
      img0.src = urlFn(1);
      const onReady0 = () => {
        targetImages[0] = img0;
        targetLoaded[0] = true;
        if (onFirstFrameReady) onFirstFrameReady();
        if (isHero) {
          loadedKeyframesCount++;
          updateLoadingBar();
        }
      };
      if (img0.decode) img0.decode().then(onReady0).catch(onReady0);
      else { img0.onload = onReady0; img0.onerror = onReady0; }
    }

    // Stage 1: Keyframe stride (stride = 4) - only 45 frames for instant, responsive scrubbing
    const stride = 4;
    const keyframes = [];
    for (let i = stride; i < frameCount; i += stride) {
      keyframes.push(i);
    }
    if ((frameCount - 1) % stride !== 0) {
      keyframes.push(frameCount - 1);
    }

    if (isHero) {
      totalKeyframesCount = keyframes.length + 1;
      updateLoadingBar();
    }

    let keyframesLoaded = 0;
    keyframes.forEach((idx) => {
      if (targetLoaded[idx]) {
        keyframesLoaded++;
        return;
      }
      batchQueue.push(urlFn(idx + 1), (img) => {
        targetImages[idx] = img;
        targetLoaded[idx] = true;
        keyframesLoaded++;
        if (isHero) {
          loadedKeyframesCount++;
          updateLoadingBar();
        }
        if (keyframesLoaded >= keyframes.length) {
          scheduleIntermediateFrames(targetImages, targetLoaded, frameCount, urlFn, stride);
        }
      }, 'high');
    });
  }

  let section1Loaded = false;
  let section2Loaded = false;
  let section5Loaded = false;

  function preloadSection1() {
    if (section1Loaded) return;
    section1Loaded = true;
    if (isMobileDevice()) {
      loadSequenceStaged(imagesMobile1, loadedMobile1, FRAME_COUNT_MOBILE_1, frameUrlMobile1, () => {
        if (isMobileDevice() && (lastFrame1 === -1 || lastFrame1 === 0)) drawFrame1(0);
      }, true);
    } else {
      loadSequenceStaged(images1, loaded1, FRAME_COUNT_1, frameUrl1, () => {
        if (!isMobileDevice() && (lastFrame1 === -1 || lastFrame1 === 0)) drawFrame1(0);
      }, true);
    }
  }

  function preloadSection2() {
    if (section2Loaded) return;
    section2Loaded = true;
    if (isMobileDevice()) {
      loadSequenceStaged(imagesMobile2, loadedMobile2, FRAME_COUNT_MOBILE_2, frameUrlMobile2, () => {
        if (isMobileDevice() && (lastFrame2 === -1 || lastFrame2 === 0)) drawFrame2(0);
      }, false);
    } else {
      loadSequenceStaged(images2, loaded2, FRAME_COUNT_2, frameUrl2, () => {
        if (!isMobileDevice() && (lastFrame2 === -1 || lastFrame2 === 0)) drawFrame2(0);
      }, false);
    }
  }

  function preloadSection5() {
    if (section5Loaded) return;
    section5Loaded = true;
    if (canvas5) {
      loadSequenceStaged(images5, loaded5, FRAME_COUNT_5, frameUrl5, () => {
        if (lastFrame5 === -1 || lastFrame5 === 0) drawFrame5(0);
      }, false);
    }
  }

  function initPreloading() {
    preloadSection1();
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => { preloadSection2(); }, { timeout: 1200 });
    } else {
      setTimeout(() => { preloadSection2(); }, 1000);
    }
  }

  // Calculate scroll targets with a dedicated 180vh slow transition zone on desktop,
  // or seamless multi-stage scroll trajectory on mobile phones
  function updateScroll(customScrollY) {
    const scrollY = typeof customScrollY === 'number' ? customScrollY : (lenis ? lenis.scroll : window.scrollY);
    const vh = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - vh;

    // Trigger preloading of subsequent animations as user scrolls towards them
    if (scrollY > 150) {
      preloadSection2();
    }
    if (scrollY > 2.5 * vh) {
      preloadSection5();
    }

    // Mobile Phone Scroll Mode: Animation 1 -> Page 2 -> Page 3 -> Page 4
    if (isMobileDevice()) {
      // Stage 1: Mobile Animation 1 scrubs over 260vh
      const s1End = 2.6 * vh;
      // Transition Zone 1->2: Page 2 glides up over 120vh
      const transLength = 1.2 * vh;
      const s2Start = s1End + transLength; // 3.8 * vh
      const s2End = s2Start + 2.0 * vh; // 5.8 * vh

      // Transition Zone 2->3: Page 3 glides up over 140vh to dock at 7.2 * vh (380 + 340 = 720vh)
      const transLength3 = 1.4 * vh;
      const s3Start = s2End + transLength3; // 7.2 * vh
      const s3End = s3Start + 1.6 * vh; // 8.8 * vh

      // 1. Mobile Animation 1 Progress [0, 1]
      if (scrollY <= s1End) {
        targetProgress1 = Math.max(0, Math.min(1, scrollY / s1End));
      } else {
        targetProgress1 = 1;
      }

      // 2. Page 2 Glide up from 100% to 0%
      if (scrollY <= s1End) {
        targetTranslateY2 = 100;
      } else if (scrollY >= s2Start) {
        targetTranslateY2 = 0;
      } else {
        const transT = (scrollY - s1End) / transLength;
        targetTranslateY2 = (1 - transT) * 100;
      }

      // 3. Mobile Animation 2 Progress [0, 1]
      const anim2StartScroll = s1End + (0.35 * transLength);
      const anim2Distance = s2End - anim2StartScroll;
      if (scrollY <= anim2StartScroll) {
        targetProgress2 = 0;
      } else if (scrollY >= s2End) {
        targetProgress2 = 1;
      } else {
        targetProgress2 = Math.max(0, Math.min(1, (scrollY - anim2StartScroll) / anim2Distance));
      }

      // 4. Page 3 Glide up from 100% to 0%, then stays docked
      if (scrollY <= s2End) {
        targetTranslateY3 = 100;
      } else if (scrollY >= s3Start) {
        targetTranslateY3 = 0;
      } else {
        const transT3 = (scrollY - s2End) / transLength3;
        targetTranslateY3 = (1 - transT3) * 100;
      }

      // 5. Mobile Animation 3 Progress [0, 1]
      const anim3Start = s2End + (0.35 * transLength3);
      const anim3Distance = s3End - anim3Start;
      if (scrollY <= anim3Start) {
        targetProgress3 = 0;
      } else if (scrollY >= s3End) {
        targetProgress3 = 1;
      } else {
        targetProgress3 = Math.max(0, Math.min(1, (scrollY - anim3Start) / anim3Distance));
      }

      // 6. Mobile Page 4 & Page 5 (Continuous flow with zero gap)
      const m5Start = 8.8 * vh;
      const m5End = 11.2 * vh;
      if (scrollY <= m5Start) {
        targetProgress5 = 0;
      } else if (scrollY >= m5End) {
        targetProgress5 = 1;
      } else {
        targetProgress5 = Math.max(0, Math.min(1, (scrollY - m5Start) / (m5End - m5Start)));
      }
      return;
    }

    // ========================================================================
    // Desktop Scroll Mode (Cinematic 5-Stage Experience - Zero Dead Gaps)
    // ========================================================================

    // Stage 1: Animation 1 scrubs over 280vh
    const s1End = 2.8 * vh;

    // Transition 1->2: Page 2 glides up smoothly over 180vh
    const transLength = 1.8 * vh;
    const s2Start = s1End + transLength; // 4.6 * vh (matches top of #page-2: 460vh)

    // Stage 2: Animation 2 scrubs over 200vh
    const s2End = s2Start + 2.0 * vh; // 6.6 * vh

    // Transition 2->3: Page 3 glides up smoothly over 140vh
    const transLength3 = 1.4 * vh;
    const s3Start = s2End + transLength3; // 8.0 * vh (matches top of #page-3: 460 + 340 = 800vh)

    // Stage 3: Animation 3 scrubs over 180vh
    const s3End = s3Start + 1.8 * vh; // 9.8 * vh

    // 1. Animation 1 Progress [0, 1]
    if (scrollY <= s1End) {
      targetProgress1 = Math.max(0, Math.min(1, scrollY / s1End));
    } else {
      targetProgress1 = 1;
    }

    // 2. Page 2 Glide up from 100% to 0%
    if (scrollY <= s1End) {
      targetTranslateY2 = 100;
    } else if (scrollY >= s2Start) {
      targetTranslateY2 = 0;
    } else {
      const transT = (scrollY - s1End) / transLength;
      targetTranslateY2 = (1 - transT) * 100;
    }

    // 3. Animation 2 Progress [0, 1]
    const anim2StartScroll = s1End + (0.5 * transLength);
    const anim2Distance = s2End - anim2StartScroll;
    if (scrollY <= anim2StartScroll) {
      targetProgress2 = 0;
    } else if (scrollY >= s2End) {
      targetProgress2 = 1;
    } else {
      targetProgress2 = Math.max(0, Math.min(1, (scrollY - anim2StartScroll) / anim2Distance));
    }

    // 4. Page 3 Glide up from 100% to 0% over Page 2, stays docked at 0%
    if (scrollY <= s2End) {
      targetTranslateY3 = 100;
    } else if (scrollY >= s3Start) {
      targetTranslateY3 = 0;
    } else {
      const transT3 = (scrollY - s2End) / transLength3;
      targetTranslateY3 = (1 - transT3) * 100;
    }

    // 5. Animation 3 Progress [0, 1] (RULES OF SURVIVAL Convergence & Rotation)
    const anim3Start = s2End + (0.35 * transLength3);
    const anim3Distance = s3End - anim3Start;
    if (scrollY <= anim3Start) {
      targetProgress3 = 0;
    } else if (scrollY >= s3End) {
      targetProgress3 = 1;
    } else {
      targetProgress3 = Math.max(0, Math.min(1, (scrollY - anim3Start) / anim3Distance));
    }

    // 6. Page 4 entrance progress [0, 1] (enters immediately below Page 3 with ZERO gap)
    const p4StartScroll = 9.6 * vh;
    const p4EndScroll = 10.6 * vh;
    if (scrollY <= p4StartScroll) {
      targetProgress4 = 0;
    } else if (scrollY >= p4EndScroll) {
      targetProgress4 = 1;
    } else {
      targetProgress4 = Math.max(0, Math.min(1, (scrollY - p4StartScroll) / (1.0 * vh)));
    }

    // 7. Animation 5 Progress [0, 1] (enters immediately following Page 4 with ZERO black gap)
    const p5StartScroll = 10.6 * vh;
    const p5EndScroll = 12.6 * vh;
    if (scrollY <= p5StartScroll) {
      targetProgress5 = 0;
    } else if (scrollY >= p5EndScroll) {
      targetProgress5 = 1;
    } else {
      targetProgress5 = Math.max(0, Math.min(1, (scrollY - p5StartScroll) / (2.0 * vh)));
    }
  }

  // Ultra-smooth animation loop with 1:1 razor-sharp frame rendering
  let prevProgress1 = -1;
  let prevProgress2 = -1;

  function loop() {
    const isMob = isMobileDevice();

    // 1. LERP Animation 1 (physics-matched fluid tracking)
    if (canvas1) {
      const diff1 = targetProgress1 - currentProgress1;
      if (Math.abs(diff1) > 0.00005) {
        currentProgress1 += diff1 * 0.45;
      } else {
        currentProgress1 = targetProgress1;
      }
      drawBlended1(Math.max(0, Math.min(1, currentProgress1)));
    }

    // 2. LERP Slow Transition (Page 2 gliding up)
    const diffY = targetTranslateY2 - currentTranslateY2;
    if (Math.abs(diffY) > 0.01) {
      currentTranslateY2 += diffY * 0.25;
    } else {
      currentTranslateY2 = targetTranslateY2;
    }

    if (page2Wrap) {
      page2Wrap.style.transform = `translateY(${currentTranslateY2.toFixed(2)}%)`;
    }

    // Smooth vignette opacity transition for Canvas 1
    if (canvas1) {
      const enterFraction = Math.max(0, Math.min(1, (100 - currentTranslateY2) / 100));
      const opacity = Math.max(0.85, 1 - 0.15 * enterFraction);
      canvas1.style.opacity = `${opacity.toFixed(3)}`;
    }

    // 3. LERP Animation 2 (desktop and mobile)
    if (canvas2) {
      const diff2 = targetProgress2 - currentProgress2;
      if (Math.abs(diff2) > 0.00005) {
        currentProgress2 += diff2 * 0.45;
      } else {
        currentProgress2 = targetProgress2;
      }
      drawBlended2(Math.max(0, Math.min(1, currentProgress2)));
    }

    // 4. LERP Page 3 Transition (Page 3 gliding up)
    const diffY3 = targetTranslateY3 - currentTranslateY3;
    if (Math.abs(diffY3) > 0.01) {
      currentTranslateY3 += diffY3 * 0.22;
    } else {
      currentTranslateY3 = targetTranslateY3;
    }

    if (page3Wrap) {
      page3Wrap.style.transform = `translateY(${currentTranslateY3.toFixed(2)}%)`;
    }

    // 5. LERP Animation 3 Progress
    const diff3 = targetProgress3 - currentProgress3;
    if (Math.abs(diff3) > 0.0001) {
      currentProgress3 += diff3 * SCROLL_LERP;
    } else {
      currentProgress3 = targetProgress3;
    }

    // 6. Animation 3: RULES OF SURVIVAL Scroll Choreography
    const p3 = Math.max(0, Math.min(1, currentProgress3));

    // A) Word "RULES" - Letters start spread apart and converge smoothly into unified word
    const isMobile = isMobileDevice();
    const spreadOffsets = isMobile ? [-90, -45, 0, 45, 90] : [-240, -120, 0, 120, 240];
    ruleLetters.forEach((letterEl, idx) => {
      if (!letterEl) return;
      const initialOffset = spreadOffsets[idx] || 0;
      const spreadFactor = Math.pow(1 - p3, 1.35);
      const currentOffset = initialOffset * spreadFactor;
      const letterScale = isMobile ? (0.92 + 0.08 * p3) : (0.86 + 0.14 * p3);
      const letterOpacity = 0.35 + 0.65 * p3;
      letterEl.style.transform = `translateX(${currentOffset.toFixed(1)}px) scale(${letterScale.toFixed(3)})`;
      letterEl.style.opacity = letterOpacity.toFixed(3);
    });

    // B) Rotating Wireframe Triangles - Exactly 90-degree rotation during scroll
    if (triangle1) {
      const rot1 = p3 * 90; // 0deg -> 90deg
      triangle1.style.transform = `rotate(${rot1.toFixed(2)}deg)`;
    }
    if (triangle2) {
      const rot2 = -25 + (p3 * 90); // -25deg -> 65deg (90deg total rotation)
      triangle2.style.transform = `rotate(${rot2.toFixed(2)}deg)`;
    }

    // C) 4 Rule Cards - Staggered emergence with scroll
    ruleCards.forEach((cardEl, idx) => {
      if (!cardEl) return;
      const cardStart = idx * 0.12;
      const cardProgress = Math.max(0, Math.min(1, (p3 - cardStart) / 0.5));
      const cardY = (1 - cardProgress) * 35;
      const cardOpacity = 0.2 + 0.8 * cardProgress;
      cardEl.style.transform = `translateY(${cardY.toFixed(1)}px)`;
      cardEl.style.opacity = cardOpacity.toFixed(3);
    });

    // Fade Canvas 2 as Page 3 enters
    if (canvas2) {
      const enterFraction3 = Math.max(0, Math.min(1, (100 - currentTranslateY3) / 100));
      const opacity = Math.max(0.85, 1 - 0.15 * enterFraction3);
      canvas2.style.opacity = `${opacity.toFixed(3)}`;
    }

    // Reveal or hide card overlay based on Page 2 docking (hide when Page 3, 4 or 5 enters)
    const cardOverlay = document.getElementById('card-overlay');
    if (cardOverlay) {
      if (currentTranslateY2 < 45 && currentTranslateY3 > 85) {
        cardOverlay.classList.add('visible');
      } else {
        cardOverlay.classList.remove('visible');
      }
    }

    if (page4Wrap) {
      page4Wrap.style.transform = 'none';
      page4Wrap.style.filter = 'none';
      page4Wrap.style.opacity = '1';
    }

    if (page5Wrap) {
      page5Wrap.style.transform = 'none';
    }

    // 9. LERP Animation 5 Progress (READY convergence)
    if (canvas5) {
      const diff5 = targetProgress5 - currentProgress5;
      if (Math.abs(diff5) > 0.00005) {
        currentProgress5 += diff5 * 0.45;
      } else {
        currentProgress5 = targetProgress5;
      }
      drawBlended5(Math.max(0, Math.min(1, currentProgress5)));
    }

    // Reveal or hide Instagram CTA based on Page 5 scroll progress
    const instaCta = document.getElementById('instagram-cta');
    if (instaCta) {
      if (currentProgress5 > 0.05 || (window.scrollY >= 10.6 * window.innerHeight)) {
        instaCta.classList.add('visible');
      } else {
        instaCta.classList.remove('visible');
      }
    }

    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // Interactive Accept Button & Modal System
  // ==========================================================================
  const acceptBtn = document.getElementById('accept-btn');
  const promptBlank = document.getElementById('prompt-blank');
  const acceptModal = document.getElementById('accept-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const resetGameBtn = document.getElementById('reset-game-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  let audioCtx = null;
  function playAcceptChime() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      // 4 ascending synthesizer chimes (Squid Game signature melodic harmonic tones)
      const frequencies = [440, 554.37, 659.25, 880];
      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.55);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.6);
      });
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  function launchGame() {
    playAcceptChime();

    if (acceptModal) acceptModal.classList.remove('active');
    if (pricingModal) pricingModal.classList.remove('active');

    const overlay = document.getElementById('game-launch-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }

    // Seamless cinematic launch into the 3D Survival Game
    setTimeout(() => {
      window.location.href = './game/';
    }, 900);
  }

  function handleAccept() {
    playAcceptChime();
    if (lenis) lenis.stop();

    // Update button state
    if (acceptBtn) {
      acceptBtn.classList.add('accepted');
      const btnText = acceptBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = '✓ Accepted';
    }

    // Fill in the blank: "Accept it Accepted or walk away"
    if (promptBlank) {
      promptBlank.classList.add('accepted');
      promptBlank.textContent = 'Accepted';
    }

    // Open Squid Game acceptance modal
    if (acceptModal) {
      acceptModal.classList.add('active');
    }
  }

  function handleCloseModal() {
    if (lenis) lenis.start();
    if (acceptModal) {
      acceptModal.classList.remove('active');
    }
  }

  function handleResetInvitation() {
    if (acceptBtn) {
      acceptBtn.classList.remove('accepted');
      const btnText = acceptBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Accept';
    }
    if (promptBlank) {
      promptBlank.classList.remove('accepted');
      promptBlank.textContent = '_______';
    }
    handleCloseModal();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAccept();
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      launchGame();
    });
  }

  if (resetGameBtn) {
    resetGameBtn.addEventListener('click', handleResetInvitation);
  }

  const launchOverlayEl = document.getElementById('game-launch-overlay');
  if (launchOverlayEl) {
    launchOverlayEl.addEventListener('click', () => {
      window.location.href = './game/';
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', handleCloseModal);
  }

  const instaLink = document.getElementById('instagram-cta');
  if (instaLink) {
    instaLink.addEventListener('click', () => {
      playAcceptChime();
    });
  }

  const brandLogoLink = document.getElementById('brand-logo-link');
  if (brandLogoLink) {
    brandLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // Interactive Navigation Bar Controls
  // ==========================================================================
  const navAbout = document.getElementById('nav-about');
  const navExperience = document.getElementById('nav-experience');
  const navPricing = document.getElementById('nav-pricing');
  const navContact = document.getElementById('nav-contact');
  const navBtnStart = document.getElementById('nav-btn-start');
  const navLinks = document.getElementById('nav-links');
  const navMobileToggle = document.getElementById('nav-mobile-toggle');

  const pricingModal = document.getElementById('pricing-modal');
  const closePricingBtn = document.getElementById('close-pricing-btn');
  const pricingBackdrop = document.getElementById('pricing-backdrop');
  const pricingJoinBtn = document.getElementById('pricing-join-btn');

  function openPricingModal() {
    playAcceptChime();
    if (lenis) lenis.stop();
    if (pricingModal) pricingModal.classList.add('active');
  }

  function closePricingModal() {
    if (lenis) lenis.start();
    if (pricingModal) pricingModal.classList.remove('active');
  }

  if (navPricing) {
    navPricing.addEventListener('click', (e) => {
      e.preventDefault();
      openPricingModal();
      if (navLinks) navLinks.classList.remove('active');
      if (navMobileToggle) navMobileToggle.classList.remove('active');
    });
  }

  if (closePricingBtn) {
    closePricingBtn.addEventListener('click', closePricingModal);
  }
  if (pricingBackdrop) {
    pricingBackdrop.addEventListener('click', closePricingModal);
  }
  if (pricingJoinBtn) {
    pricingJoinBtn.addEventListener('click', () => {
      closePricingModal();
      launchGame();
    });
  }

  // Smooth scroll navigation targets using native hardware-accelerated smooth behavior
  if (navAbout) {
    navAbout.addEventListener('click', (e) => {
      e.preventDefault();
      const vh = window.innerHeight;
      const top = isMobileDevice() ? 3.8 * vh : 4.6 * vh;
      if (lenis) lenis.scrollTo(top, { duration: 1.3 });
      else window.scrollTo({ top, behavior: 'smooth' });
      if (navLinks) navLinks.classList.remove('active');
      if (navMobileToggle) navMobileToggle.classList.remove('active');
    });
  }

  if (navExperience) {
    navExperience.addEventListener('click', (e) => {
      e.preventDefault();
      const vh = window.innerHeight;
      const top = isMobileDevice() ? 7.2 * vh : 8.0 * vh;
      if (lenis) lenis.scrollTo(top, { duration: 1.3 });
      else window.scrollTo({ top, behavior: 'smooth' });
      if (navLinks) navLinks.classList.remove('active');
      if (navMobileToggle) navMobileToggle.classList.remove('active');
    });
  }

  if (navContact) {
    navContact.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(document.documentElement.scrollHeight, { duration: 1.5 });
      else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      if (navLinks) navLinks.classList.remove('active');
      if (navMobileToggle) navMobileToggle.classList.remove('active');
    });
  }

  // START NOW Button: directly launches the 3D game
  if (navBtnStart) {
    navBtnStart.addEventListener('click', (e) => {
      e.stopPropagation();
      launchGame();
    });
  }

  // Mobile Hamburger Toggle
  if (navMobileToggle && navLinks) {
    navMobileToggle.addEventListener('click', () => {
      navMobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (pricingModal && pricingModal.classList.contains('active')) {
        closePricingModal();
        return;
      }
      if (acceptModal && acceptModal.classList.contains('active')) {
        handleCloseModal();
        return;
      }
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (navMobileToggle) navMobileToggle.classList.remove('active');
        return;
      }
    }
  });

  // Native hardware-accelerated scroll listener
  window.addEventListener('scroll', () => {
    updateScroll();
  }, { passive: true });

  window.addEventListener('resize', () => {
    initPreloading();
    resizeCanvases();
    updateScroll();
  });

  initPreloading();
  resizeCanvases();
  updateScroll();
  requestAnimationFrame(loop);
})();

