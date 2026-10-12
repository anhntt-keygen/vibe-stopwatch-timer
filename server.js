const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ các tệp tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Khởi động server lắng nghe kết nối
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Vibe Stopwatch & Timer App is running!`);
  console.log(`👉 URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});

module.exports = server;
```

---