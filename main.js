// task : render song, scroll top, play pause seek, cd rotate, next/prev, random, next/repeat when ended, active song
// scroll active song into view, play song when click
// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const STORE = "New-store";
const playlist = $(".playlist");
const cd = $(".cd");
const cdThumb = $(".cd-thumb");
const header = $("header h2");
const duration = $(".duration");
const remaining = $(".remaining");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $(".progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const volume = $(".volume");
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(STORE)) || {},
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: () => {
        return this.songs[this.currentIndex];
      },
    });
  },
  setconfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(STORE, JSON.stringify(this.config));
  },
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
  playedSongs: [],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div class="song ${
        this.currentIndex === index ? "active" : ""
      }" data-index = '${index}' >
               <div class="thumb" style='background-image: url("${
                 song.image
               }")'></div>
               <div class="body">
                   <h3 class='title'>${song.name}</h3>
                   <p class='author'>${song.singer}</p>
               </div>
               <div class="option"></div>
        </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  formatTime: function (seconds) {
    var minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  },
  scrollToActive: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadCurrentSong: function () {
    header.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
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
    } while (
      newIndex === this.currentIndex ||
      this.playedSongs.includes(newIndex)
    );
    this.playedSongs.push(newIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
    if (this.playedSongs === this.songs.length) {
      this.playedSongs = [];
    }
  },
  handleEvent: function () {
    const _this = this;
    // Xử lý scroll của web
    const cdWidth = cd.offsetWidth;
    document.onscroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newWidth = cdWidth - scrollTop;
      cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
      cd.style.opacity = newWidth / cdWidth;
    };
    // Xử lý cd rotate
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();
    // Xử lý nút chơi nhạc
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // Xử lý audio đang trạng thái play
    audio.onplay = function () {
      // Xử lý thanh progress cập nhật theo thời gian thật
      setInterval(() => {
        if (audio.duration) {
          var progressPercent = Math.floor(
            (audio.currentTime * 100) / audio.duration
          );
          progress.value = progressPercent;
          progress.style.background = `linear-gradient(to right, #ec1f55 ${progressPercent}%  , #D3D3D3 ${progressPercent}% )`;
        }
      }, 500);
      // Cập nhật trạng phái ở chế độ play
      _this.isPlaying = true;
      player.classList.add("playing");
      _this.render();
      cdThumbAnimate.play();
    };
    // Xử lý audio đang ở trạng thát dừng
    audio.onpause = function () {
      _this.isPlaying = false;
      _this.render();
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // Xử lý chức năng thay đổi liên tục
    audio.ontimeupdate = function () {
      // Xử lý thời gian cập nhật theo thời gian thật của bài hát
      if (!audio.duration) {
        duration.textContent = "00:00";
      } else {
        duration.textContent = _this.formatTime(audio.currentTime);
        remaining.textContent = _this.formatTime(audio.duration);
      }
    };
    // Xử lý khi thay đổi tiến độ bài hát khi click
    progress.onchange = function (e) {
      const seekTime = Math.floor((audio.duration / 100) * e.target.value);
      audio.currentTime = seekTime;
    };
    // Xử lý lùi bài bát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else if (_this.isRepeat) {
        _this.loadCurrentSong();
      } else {
        _this.prevSong();
      }
      _this.setconfig();
      audio.play();
    };
    // Xử lý tiến tới bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else if (_this.isRepeat) {
        _this.loadCurrentSong();
      } else {
        _this.nextSong();
      }
      _this.setconfig();
      audio.play();
    };
    // Xử lý random
    randomBtn.onclick = function () {
      if (_this.isRepeat) {
        randomBtn.preventDefault();
      } else {
        _this.isRandom = !_this.isRandom;
        randomBtn.classList.toggle("active", _this.isRandom);
      }
    };
    // Xử lý repeat
    repeatBtn.onclick = function () {
      if (_this.isRandom) {
        repeatBtn.preventDefault();
      } else {
        _this.isRepeat = !_this.isRepeat;
        repeatBtn.classList.toggle("active", _this.isRepeat);
      }
    };
    // Xử lý khi kết thúc bài
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        _this.nextSong();
        audio.play();
      }
    };
    // Xử lý khi click vào bài hát
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        audio.play();
      }
    };
    // Xử lý âm thanh to hay nhỏ của nhạc
    volume.oninput = function (e) {
      audio.volume = e.target.value / 100;
    };
  },
  start: function () {
    // Gán cấu hình vào ứng dụng
    this.loadConfig();
    // Định nghĩa biến hoặc giá trị hàm cho ứng dụng
    this.defineProperties();
    //lắng nghe sự kiện và xử lý nó
    this.handleEvent();
    // Cuộc màn hình di chuyển theo  bài hát đang được active
    this.scrollToActive();
    // Xuất data lên ứng dụng
    this.render();
    // tải lên hình ảnh song hiện tại lên ứng dụng
    this.loadCurrentSong();
  },
};
app.start();
