// --- TRẠNG THÁI TOÀN CỤC CỦA ỨNG DỤNG ---
const state = {
  activeTab: 'stopwatch',
  stopwatch: {
    isRunning: false,
    startTime: 0,
    elapsedTime: 0,
    timerId: null,
    laps: []
  },
  timer: {
    isRunning: false,
    totalDuration: 0, // tính bằng mili-giây
    remainingTime: 0, // tính bằng mili-giây
    timerId: null,
    alarmIntervalId: null
  }
};

// --- KHỞI TẠO KHI TẢI TRANG ---
document.addEventListener('DOMContentLoaded', () => {
  populateSelectOptions();
  loadStateFromLocalStorage();
  initProgressRing();
  renderStopwatch();
  renderTimer();
  updateTabUI();
});

// --- CHUYỂN ĐỔI TAB ---
function switchTab(tabName) {
  state.activeTab = tabName;
  updateTabUI();
  saveStateToLocalStorage();
}

function updateTabUI() {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (state.activeTab === 'stopwatch') {
    document.getElementById('tab-stopwatch-btn').classList.add('active');
    document.getElementById('stopwatch-section').classList.add('active');
  } else {
    document.getElementById('tab-timer-btn').classList.add('active');
    document.getElementById('timer-section').classList.add('active');
  }
}

// --- LOGIC BẤM GIỜ (STOPWATCH) ---
function handleStopwatchStart() {
  const startBtn = document.getElementById('sw-start-btn');
  const lapBtn = document.getElementById('sw-lap-btn');

  if (!state.stopwatch.isRunning) {
    // Bắt đầu chạy
    state.stopwatch.isRunning = true;
    state.stopwatch.startTime = Date.now() - state.stopwatch.elapsedTime;
    
    state.stopwatch.timerId = requestAnimationFrame(updateStopwatchTick);
    
    startBtn.textContent = 'Tạm dừng';
    startBtn.className = 'btn btn-secondary';
    lapBtn.disabled = false;
  } else {
    // Tạm dừng
    state.stopwatch.isRunning = false;
    cancelAnimationFrame(state.stopwatch.timerId);
    
    startBtn.textContent = 'Tiếp tục';
    startBtn.className = 'btn btn-primary';
    lapBtn.disabled = true;
  }
  saveStateToLocalStorage();
}

function updateStopwatchTick() {
  if (!state.stopwatch.isRunning) return;
  
  state.stopwatch.elapsedTime = Date.now() - state.stopwatch.startTime;
  renderStopwatchDisplay(state.stopwatch.elapsedTime);
  state.stopwatch.timerId = requestAnimationFrame(updateStopwatchTick);
}

function renderStopwatchDisplay(ms) {
  document.getElementById('stopwatch-display').textContent = formatTime(ms, true);
}

function handleStopwatchLap() {
  if (!state.stopwatch.isRunning) return;

  const currentTotal = state.stopwatch.elapsedTime;
  const previousTotal = state.stopwatch.laps.length > 0 
    ? state.stopwatch.laps[state.stopwatch.laps.length - 1].totalTime 
    : 0;
  
  const lapTime = currentTotal - previousTotal;
  const lapNumber = state.stopwatch.laps.length + 1;

  state.stopwatch.laps.push({
    number: lapNumber,
    lapTime: lapTime,
    totalTime: currentTotal
  });

  renderLapsTable();
  saveStateToLocalStorage();
}

function handleStopwatchReset() {
  state.stopwatch.isRunning = false;
  cancelAnimationFrame(state.stopwatch.timerId);
  state.stopwatch.elapsedTime = 0;
  state.stopwatch.startTime = 0;
  state.stopwatch.laps = [];

  renderStopwatchDisplay(0);
  renderLapsTable();

  const startBtn = document.getElementById('sw-start-btn');
  startBtn.textContent = 'Bắt đầu';
  startBtn.className = 'btn btn-primary';
  
  document.getElementById('sw-lap-btn').disabled = true;
  saveStateToLocalStorage();
}

function renderLapsTable() {
  const lapsList = document.getElementById('laps-list');
  lapsList.innerHTML = '';

  if (state.stopwatch.laps.length === 0) return;

  // Tìm vòng nhanh nhất và chậm nhất
  let fastestIndex = -1;
  let slowestIndex = -1;
  let minTime = Infinity;
  let maxTime = -Infinity;

  if (state.stopwatch.laps.length > 1) {
    state.stopwatch.laps.forEach((lap, index) => {
      if (lap.lapTime < minTime) {
        minTime = lap.lapTime;
        fastestIndex = index;
      }
      if (lap.lapTime > maxTime) {
        maxTime = lap.lapTime;
        slowestIndex = index;
      }
    });
  }

  // Render từ vòng mới nhất lên đầu
  for (let i = state.stopwatch.laps.length - 1; i >= 0; i--) {
    const lap = state.stopwatch.laps[i];
    const tr = document.createElement('tr');

    if (i === fastestIndex) {
      tr.className = 'fastest-lap';
    } else if (i === slowestIndex) {
      tr.className = 'slowest-lap';
    }

    tr.innerHTML = `
      <td>Vòng ${lap.number}</td>
      <td>${formatTime(lap.lapTime, true)}</td>
      <td>${formatTime(lap.totalTime, true)}</td>
    `;
    lapsList.appendChild(tr);
  }
}

// --- LOGIC HẸN GIỜ (TIMER) ---
const circle = document.getElementById('timer-progress-bar');
let radius, circumference;

function initProgressRing() {
  radius = circle.r.baseVal.value;
  circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  setProgress(100);
}

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function populateSelectOptions() {
  const hoursSelect = document.getElementById('timer-hours');
  const minutesSelect = document.getElementById('timer-minutes');
  const secondsSelect = document.getElementById('timer-seconds');

  for (let i = 0; i < 24; i++) {
    hoursSelect.options[hoursSelect.options.length] = new Option(i.toString().padStart(2, '0'), i);
  }
  for (let i = 0; i < 60; i++) {
    minutesSelect.options[minutesSelect.options.length] = new Option(i.toString().padStart(2, '0'), i);
    secondsSelect.options[secondsSelect.options.length] = new Option(i.toString().padStart(2, '0'), i);
  }
}

function handleTimerStart() {
  const startBtn = document.getElementById('timer-start-btn');
  const cancelBtn = document.getElementById('timer-cancel-btn');

  if (!state.timer.isRunning) {
    // Nếu đang ở trạng thái dừng hẳn, tính toán tổng thời gian mới từ Selectors
    if (state.timer.remainingTime <= 0) {
      const hours = parseInt(document.getElementById('timer-hours').value) || 0;
      const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
      const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;

      const totalMs = ((hours * 3600) + (minutes * 60) + seconds) * 1000;
      if (totalMs <= 0) return; // Không hẹn giờ 0 giây

      state.timer.totalDuration = totalMs;
      state.timer.remainingTime = totalMs;
    }

    state.timer.isRunning = true;
    state.timer.endTime = Date.now() + state.timer.remainingTime;

    state.timer.timerId = setInterval(updateTimerTick, 100);

    // Ẩn bộ chọn thời gian khi đang chạy
    document.getElementById('timer-inputs').style.display = 'none';
    startBtn.textContent = 'Tạm dừng';
    startBtn.className = 'btn btn-secondary';
    cancelBtn.disabled = false;
  } else {
    // Tạm dừng hẹn giờ
    state.timer.isRunning = false;
    clearInterval(state.timer.timerId);
    state.timer.remainingTime = state.timer.endTime - Date.now();

    startBtn.textContent = 'Tiếp tục';
    startBtn.className = 'btn btn-primary';
  }
  saveStateToLocalStorage();
}

function updateTimerTick() {
  const now = Date.now();
  state.timer.remainingTime = state.timer.endTime - now;

  if (state.timer.remainingTime <= 0) {
    state.timer.remainingTime = 0;
    clearInterval(state.timer.timerId);
    state.timer.isRunning = false;
    
    renderTimerDisplay(0);
    setProgress(0);
    triggerAlarm();
  } else {
    renderTimerDisplay(state.timer.remainingTime);
    const percent = (state.timer.remainingTime / state.timer.totalDuration) * 100;
    setProgress(percent);
  }
}

function renderTimerDisplay(ms) {
  document.getElementById('timer-display').textContent = formatTime(ms, false);
}

function handleTimerCancel() {
  clearInterval(state.timer.timerId);
  stopAlarm();

  state.timer.isRunning = false;
  state.timer.remainingTime = 0;
  state.timer.totalDuration = 0;

  renderTimerDisplay(0);
  setProgress(100);

  // Hiển thị lại bộ chọn thời gian
  document.getElementById('timer-inputs').style.display = 'flex';
  
  const startBtn = document.getElementById('timer-start-btn');
  startBtn.textContent = 'Bắt đầu';
  startBtn.className = 'btn btn-primary';
  
  document.getElementById('timer-cancel-btn').disabled = true;
  saveStateToLocalStorage();
}

function triggerAlarm() {
  const appContainer = document.querySelector('.app-container');
  const alarmSound = document.getElementById('alarm-sound');
  
  appContainer.classList.add('alarm-active');
  
  // Phát âm thanh lặp lại
  alarmSound.play().catch(err => console.log("Yêu cầu tương tác của người dùng để phát âm thanh"));
  state.timer.alarmIntervalId = setInterval(() => {
    alarmSound.play().catch(() => {});
  }, 1500);

  const startBtn = document.getElementById('timer-start-btn');
  startBtn.textContent = 'Xong';
  startBtn.className = 'btn btn-primary';
}

function stopAlarm() {
  const appContainer = document.querySelector('.app-container');
  const alarmSound = document.getElementById('alarm-sound');
  
  appContainer.classList.remove('alarm-active');
  if (state.timer.alarmIntervalId) {
    clearInterval(state.timer.alarmIntervalId);
    state.timer.alarmIntervalId = null;
  }
  alarmSound.pause();
  alarmSound.currentTime = 0;
}

// --- CÁC HÀM TRỢ GIÚP (HELPERS) ---
function formatTime(ms, includeCentiseconds = false) {
  if (ms < 0) ms = 0;
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => num.toString().padStart(2, '0');

  let timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  if (includeCentiseconds) {
    const centiseconds = Math.floor((ms % 1000) / 10);
    timeString += `.${pad(centiseconds)}`;
  }

  return timeString;
}

// --- ĐỒNG BỘ LOCAL STORAGE ---
function saveStateToLocalStorage() {
  const dataToSave = {
    activeTab: state.activeTab,
    stopwatch: {
      elapsedTime: state.stopwatch.elapsedTime,
      laps: state.stopwatch.laps
    },
    timer: {
      totalDuration: state.timer.totalDuration,
      remainingTime: state.timer.remainingTime > 0 ? state.timer.remainingTime : 0
    }
  };
  localStorage.setItem('vibe_time_state', JSON.stringify(dataToSave));
}

function loadStateFromLocalStorage() {
  const savedData = localStorage.getItem('vibe_time_state');
  if (!savedData) return;

  try {
    const parsed = JSON.parse(savedData);
    state.activeTab = parsed.activeTab || 'stopwatch';

    // Khôi phục Stopwatch
    if (parsed.stopwatch) {
      state.stopwatch.elapsedTime = parsed.stopwatch.elapsedTime || 0;
      state.stopwatch.laps = parsed.stopwatch.laps || [];
    }

    // Khôi phục Timer
    if (parsed.timer) {
      state.timer.totalDuration = parsed.timer.totalDuration || 0;
      state.timer.remainingTime = parsed.timer.remainingTime || 0;
    }
  } catch (e) {
    console.error("Lỗi khôi phục dữ liệu LocalStorage:", e);
  }
}

function renderStopwatch() {
  renderStopwatchDisplay(state.stopwatch.elapsedTime);
  renderLapsTable();
}

function renderTimer() {
  if (state.timer.remainingTime > 0) {
    renderTimerDisplay(state.timer.remainingTime);
    const percent = (state.timer.remainingTime / state.timer.totalDuration) * 100;
    setProgress(percent);
    
    // Hiển thị nút Hủy và chuyển nút Bắt đầu thành Tiếp tục
    document.getElementById('timer-inputs').style.display = 'none';
    document.getElementById('timer-cancel-btn').disabled = false;
    document.getElementById('timer-start-btn').textContent = 'Tiếp tục';
  } else {
    renderTimerDisplay(0);
    setProgress(100);
    document.getElementById('timer-inputs').style.display = 'flex';
    document.getElementById('timer-cancel-btn').disabled = true;
    document.getElementById('timer-start-btn').textContent = 'Bắt đầu';
  }
}
```

---