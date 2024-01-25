// task : render song, scroll top, play pause seek, cd rotate, next/prev, random, next/repeat when ended, active song
// scroll active song into view, play song when click
// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORE = "F8_PLAYER";
const heading = $("header h2");
const player = $(".player");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $(".progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORE)) || {},
  songs: [
    {
      name: "Two Flower",
      singer: "vanguard sound",
      path: "./music/song 1.mp3",
      image: "./img/ảnh 1.jpeg",
    },
    {
      name: "al higuchi",
      singer: "Raftaar x Salim Merchant x Karma",
      path: "./music/song 2.mp3",
      image: "./img/ảnh 2.jpeg",
    },
    {
      name: "Naachne Ka Shaunq",
      singer: "Raftaar x Brobha V",
      path: "./music/song 3.mp3",
      image: "./img/ảnh 3.jpeg",
    },
    {
      name: "still here",
      singer: "LOL",
      path: "./music/song 4.mp3",
      image: "./img/ảnh 4.jpeg",
    },
    {
      name: "Hiroyuki Sawano",
      singer: "vanguard sound",
      path: "./music/song 5.mp3",
      image: "./img/ảnh 5.jpeg",
    },
    {
      name: "Haiiro no Saga",
      singer: "ChouCho",
      path: "./music/song 6.mp3",
      image: "./img/ảnh 6.jpeg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORE, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index ='${index}'>
                 <div class="thumb"
                     style="background-image: url('${song.image}')">
                 </div>
                 <div class="body">
                     <h3 class="title">${song.name}</h3>
                     <p class="author">${song.singer}</p>
                 </div>
                 <div class="option">
                     <i class="ti-more"></i>
                 </div>
            </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    // Xử lý cd thumb
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();
    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newWidth = cdWidth - scrollTop;
      cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
      cd.style.opacity = newWidth / cdWidth;
    };
    // Xử lý khi ấn Play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // khi song đc play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    // khi song đc pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // khi tiến độ song thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    // Xử lý khi tua
    progress.onchange = function (e) {
      const seekTime = Math.floor((audio.duration / 100) * e.target.value);
      audio.currentTime = seekTime;
    };
    //khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActive();
    };
    // khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActive();
    };
    // random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig(".isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };
    // lặp lại song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig(".isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // Xử lý next khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Lắng nghe hành vi click playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      // Xử lý click vào song
      if (songNode || e.target.closest(".option")) {
        // Xử lý click vào song
        if (songNode) {
          _this.currentIndex = parseFloat(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // Xử lý click vào option
        if (e.target.closest(".option")) {
          console.log(_this);
        }
      }
    };
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  scrollToActive: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // gán cấu hình từ cofig vào ứng dụng
    this.loadConfig();
    // Định nghĩa thuộc tính cho Oject
    this.defineProperties();
    // Lắng nghe / xử lý sự kiện
    this.handleEvents();
    // Tải thông tin bài nhạc hiện tại khi chạy ứng dụng
    this.loadCurrentSong();
    // Render playlist
    this.render();
    // Hiển thị trạng thái ban đầu của button repear & random
    randomBtn.classList.toggle("active", _this.isRandom);
    repeatBtn.classList.toggle("active", _this.isRepeat);
  },
};
app.start();
