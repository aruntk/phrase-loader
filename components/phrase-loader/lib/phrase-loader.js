'use strict';

PolymerSvgTemplate('phrase-loader');
Polymer({
  is: 'phrase-loader',
  properties: {
    phrases: {
      type: Array,
      value: ['Feeding unicorns', 'Grabbing tasks', 'Collating conversations', 'Reticulating splines', 'Pondering emptiness', 'Considering alternatives', 'Shuffling bits', 'Celebrating moments', 'Generating phrases', 'Simulating workflow', 'Empowering humanity', 'Being aspirational', 'Doing the hokey pokey', 'Bueller', 'Cracking jokes', 'Slacking off']
    },
    _phrases: {
      type: Array
    },
    active: Boolean,
    checkmarkIdPrefix: {
      type: String,
      value: "loadingCheckSVG-"
    },
    checkmarkCircleIdPrefix: {
      type: String,
      value: "loadingCheckCircleSVG-"
    },
    verticalSpacing: {
      type: Number,
      value: 50
    },
    state: {
      type: String,
      value: 'stopped'
    },
    requestIds: {
      type: Array,
      value: []
    },
    loop: {
      type: Boolean,
      value: false
    },
    shuffle: {
      type: Boolean,
      value: true
    }
  },
  observers: ['activeChanged(active)'],
  activeChanged: function activeChanged(active) {
    if (active) {
      this.addPhrases();
      this.set('state', 'active');
      this.async(this.animateLoading);
    } else {
      this.set('state', 'stopped');
      this.requestIds.forEach(function (v) {
        window.cancelAnimationFrame(v);
      });
      this.set('requestIds', []);
      this.set('_phrases', []);
    }
  },
  addPhrases: function addPhrases() {
    var phrases = this.shuffle ? this.shuffleArray(this.phrases) : this.phrases;
    this.set('_phrases', phrases);
  },
  shuffleArray: function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  },
  yOffset: function yOffset(index) {
    return 30 + this.verticalSpacing * index;
  },
  transformOffset: function transformOffset(index) {
    return 10 + this.verticalSpacing * index;
  },
  getPhraseChild: function getPhraseChild(selector) {
    return this.$.phrases.querySelector(selector);
  },
  animateLoading: function animateLoading() {
    var _this = this;

    var checkmarkIdPrefix = this.checkmarkIdPrefix;
    var checkmarkCircleIdPrefix = this.checkmarkCircleIdPrefix;
    var verticalSpacing = this.verticalSpacing;
    var startTime = new Date().getTime();
    var upwardMovingGroup = this.$.phrases;
    upwardMovingGroup.currentY = 0;
    var checks = this._phrases.map(function (v, i) {
      return {
        check: _this.getPhraseChild('#' + (checkmarkIdPrefix + i)),
        circle: _this.getPhraseChild('#' + (checkmarkCircleIdPrefix + i))
      };
    });
    var easeInOut = this.easeInOut;
    this._animateLoading = function () {
      var now = new Date().getTime();
      upwardMovingGroup.setAttribute('transform', 'translate(0 ' + upwardMovingGroup.currentY + ')');
      upwardMovingGroup.currentY -= 1.35 * easeInOut(now);
      checks.forEach(function (check, i) {
        var color_change_boundary = -i * verticalSpacing + verticalSpacing + 15;
        if (upwardMovingGroup.currentY < color_change_boundary) {
          var alpha = Math.max(Math.min(1 - (upwardMovingGroup.currentY - color_change_boundary + 15) / 30, 1), 0);
          check.circle.setAttribute('fill', 'rgba(255, 255, 255, ' + alpha + ')');
          var check_color = [Math.round(255 * (1 - alpha) + 120 * alpha), Math.round(255 * (1 - alpha) + 154 * alpha)];
          check.check.setAttribute('fill', 'rgba(255, ' + check_color[0] + ',' + check_color[1] + ', 1)');
        }
      });
      var currentY = upwardMovingGroup.currentY;
      var maxY = (_this._phrases.length - 2) * verticalSpacing + 10;
      if (now - startTime < 30000 && currentY > -maxY) {
        _this.push('requestIds', window.requestAnimationFrame(_this._animateLoading));
      } else if (_this.loop && currentY <= -maxY) {
        // TODO better implementation of loop
        _this.set('_phrases', []);
        _this.async(function () {
          _this.addPhrases();
          _this.async(_this.animateLoading);
        }, 10);
      }
    };
    this._animateLoading();
  },
  easeInOut: function easeInOut(t) {
    var period = 200;
    return (Math.sin(t / period + 100) + 1) / 2;
  }
});