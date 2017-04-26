PolymerSvgTemplate('phrase-loader');
Polymer({
  is: 'phrase-loader',
  properties: {
    phrases: {
      type: Array,
      value: [
        'Feeding unicorns',
        'Grabbing tasks',
        'Collating conversations',
        'Reticulating splines',
        'Pondering emptiness',
        'Considering alternatives',
        'Shuffling bits',
        'Celebrating moments',
        'Generating phrases',
        'Simulating workflow',
        'Empowering humanity',
        'Being aspirational',
        'Doing the hokey pokey',
        'Bueller',
        'Cracking jokes',
        'Slacking off'
      ],
    },
    _phrases: {
      type: Array,
    },
    active: Boolean,
    checkmarkIdPrefix: {
      type: String,
      value: "loadingCheckSVG-",
    },
    checkmarkCircleIdPrefix:{
      type: String,
      value: "loadingCheckCircleSVG-",
    },
    verticalSpacing: {
      type: Number,
      value: 50,
    },
    state: {
      type: String,
      value: 'stopped'
    },
    requestIds: {
      type: Array,
      value: [],
    },
    loop: {
      type: Boolean,
      value: false,
    },
    shuffle: {
      type: Boolean,
      value: true,
    }
  },
  observers: ['activeChanged(active)'],
  activeChanged(active) {
    if (active) {
      this.addPhrases();
      this.set('state', 'active');
      this.async(this.animateLoading);
    } else {
      this.set('state', 'stopped');
      this.requestIds.forEach((v) => {
        window.cancelAnimationFrame(v);
      });
      this.set('requestIds', []);
      this.set('_phrases', []);
    }
  },
  addPhrases() {
    const phrases = this.shuffle ? this.shuffleArray(this.phrases) : this.phrases;
    this.set('_phrases', phrases);
  },
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  },
  yOffset(index) {
    return 30 + this.verticalSpacing * index;
  },
  transformOffset(index) {
    return 10 + this.verticalSpacing * index;
  },
  getPhraseChild(selector) {
    return this.$.phrases.querySelector(selector);
  },
  animateLoading() {
    const checkmarkIdPrefix = this.checkmarkIdPrefix;
    const checkmarkCircleIdPrefix = this.checkmarkCircleIdPrefix;
    const verticalSpacing = this.verticalSpacing;
    let startTime = new Date().getTime();
    const upwardMovingGroup = this.$.phrases;
    upwardMovingGroup.currentY = 0;
    const checks = this._phrases.map((v, i) => {
      return {
        check: this.getPhraseChild(`#${checkmarkIdPrefix + i}`),
        circle: this.getPhraseChild(`#${checkmarkCircleIdPrefix + i}`),
      };
    });
    const easeInOut = this.easeInOut;
    this._animateLoading = () => {
      const now = new Date().getTime();
      upwardMovingGroup.setAttribute('transform', 'translate(0 ' + upwardMovingGroup.currentY + ')');
      upwardMovingGroup.currentY -= 1.35 * easeInOut(now);
      checks.forEach(function(check, i) {
        const color_change_boundary = - i * verticalSpacing + verticalSpacing + 15;
        if (upwardMovingGroup.currentY < color_change_boundary) {
          const alpha = Math.max(Math.min(1 - (upwardMovingGroup.currentY - color_change_boundary + 15)/30, 1), 0);
          check.circle.setAttribute('fill', 'rgba(255, 255, 255, ' + alpha + ')');
          const check_color = [Math.round(255 * (1-alpha) + 120 * alpha), Math.round(255 * (1-alpha) + 154 * alpha)];
          check.check.setAttribute('fill', 'rgba(255, ' + check_color[0] + ',' + check_color[1] + ', 1)');
        }
      });
      const currentY = upwardMovingGroup.currentY;
      const maxY = (this._phrases.length - 2) * verticalSpacing + 10;
      if (now - startTime < 30000 && currentY > -maxY) {
        this.push('requestIds', window.requestAnimationFrame(this._animateLoading));
      } else if (this.loop && currentY <= -maxY ) {
        // TODO better implementation of loop
        this.set('_phrases', []);
        this.async(() => {
          this.addPhrases();
          this.async(this.animateLoading);
        }, 10);
      }
    }
    this._animateLoading();
  },
  easeInOut(t) {
    const period = 200;
    return (Math.sin(t / period + 100) + 1) /2;
  }
});

