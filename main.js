const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "PLAYER";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const playlist = $(".playlist");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
  current: 0,

  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

  songs: [
    {
      name: "Bên ấy bên này",
      singer: "Raftaar x Fortnite",
      path: "./music/Bên ấy bên này.mp3",
      image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg",
    },
    {
      name: "Có đau thì đau một mình",
      singer: "Raftaar x Salim Merchant x Karma",
      path: "./music/Có đau thì đau một mình.mp3",
      image: "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg",
    },
    {
      name: "Ghé qua ",
      singer: "Raftaar x Brobha V",
      path: "./music/Ghé qua.mp3",
      image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg",
    },
    {
      name: "Nụ hôn Bisus",
      singer: "Raftaar x Nawazuddin Siddiqui",
      path: "./music/Nụ hôn Bisus.mp3",
      image: "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg",
    },
    {
      name: "Trước khi tuổi trẻ này đóng lối",
      singer: "Raftaar",
      path: "./music/Trước khi tuổi trẻ này đóng lối .mp3",
      image: "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  render: function () {
    const htmls = app.songs.map((song, index) => {
      return `
          <div class="song ${index === this.current ? "active" : ""}" data-index=${index}>
                    <div class="thumb" style="background-image: url(${song.image})"></div>
                              <div class="body">
                              <h3 class="title">${song.name}</h3>
                              <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                              <i class="fas fa-ellipsis-h"></i>
                    </div>
          </div>
          `;
    });

    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.current];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Rotate the CD disk when playing or stopping
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, // 10 seconds
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();

    // Cope with resizing the CD disk
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Deal with clicking the play button
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // When the song is being played
    audio.onplay = function () {
      cdThumbAnimate.play();
      player.classList.add("playing");
      _this.isPlaying = true;
      _this.render();
    };

    // When the song is being paused
    audio.onpause = function () {
      cdThumbAnimate.pause();
      player.classList.remove("playing");
      _this.isPlaying = false;
    };

    // When the progressing of the song is changed
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressBar = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = progressBar;
      }
    };

    // Solve when fasting foward the song
    progress.oninput = function (event) {
      const seekTime = (audio.duration / 100) * event.target.value;
      audio.currentTime = seekTime;
    };

    // When clicking on the next button
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.scrollToActiveSong();
    };

    // When clicking on the prve button
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.scrollToActiveSong();
    };

    // Random songs when the random button is clicked
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      this.classList.toggle("active", _this.isRandom);
    };

    // Handle repeat the playing song again
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      this.classList.toggle("active", _this.isRepeat);
    };

    // Continue the next song when ending the current song
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        // click() is the method that it automatically click, click() and onclick is totally different
        nextBtn.click();
      }
    };

    // Listen the behavior clicked on the items of the playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Handle when clicking on the song
        if (songNode.closest(".song:not(.active)")) {
          _this.current = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Handle when clicking on the option button
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  nextSong: function () {
    this.current++;
    if (this.current >= this.songs.length) {
      this.current = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.current--;
    if (this.current < 0) {
      this.current = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.current === newIndex);

    this.current = newIndex;
    this.loadCurrentSong();
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = `${this.currentSong.path}`;
  },

  start: function () {
    // Assign configuaration into app
    this.loadConfig();

    // Define properties for the object
    this.defineProperties();

    // Listen and deal with events (DOM, event)
    this.handleEvents();

    // Load the current song information into UI when running the app
    this.loadCurrentSong();

    // Render the playlist
    this.render();

    // Show the original status of the repeat button and random button
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
    console.log(this.isRandom, this.isRepeat);
  },
};

app.start();
