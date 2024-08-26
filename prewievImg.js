const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

function downloadVideo(url, outputPath, callback) {
  console.log('Начинаю загрузку видео...');
  const file = fs.createWriteStream(outputPath);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      console.log('Видео успешно загружено.');
      file.close(callback);
    });
  }).on('error', (err) => {
    fs.unlink(outputPath);
    console.error(`Ошибка при загрузке видео: ${err.message}`);
  });
}

function generateThumbnails(videoPath, outputDir) {
  const absoluteVideoPath = path.resolve(videoPath);
  const absoluteOutputDir = path.resolve(outputDir);

  // Проверка и создание каталога, если его нет
  if (!fs.existsSync(absoluteOutputDir)) {
    console.log(`Каталог ${absoluteOutputDir} не существует. Создаю...`);
    fs.mkdirSync(absoluteOutputDir, { recursive: true });
    console.log(`Каталог ${absoluteOutputDir} создан.`);
  } else {
    console.log(`Каталог ${absoluteOutputDir} уже существует.`);
  }

  console.log('Начинаю генерацию миниатюр...');
  const outputPattern = path.join(absoluteOutputDir, 'thumbnail-%d.jpg');
  // Создание миниатюр каждые 5 секунд
  const cmd = `ffmpeg -i "${absoluteVideoPath}" -vf "fps=1/5,scale=320:180" "${outputPattern}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка при создании миниатюр: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`FFmpeg stderr: ${stderr}`);
      return;
    }
    console.log(`Миниатюры успешно созданы в ${absoluteOutputDir}`);
  });
}

// Пример использования:
const videoUrl = 'https://xn----8sbbdcswqh2clm4frcf.xn--p1ai/Video.mp4';
const localVideoPath = path.join(__dirname, 'downloadedVideo.mp4');
console.log('Скрипт запущен.');

// Загрузка видео и генерация миниатюр
downloadVideo(videoUrl, localVideoPath, () => {
  console.log('Начинаю генерацию миниатюр после загрузки видео...');
  generateThumbnails(localVideoPath, './client/public/previewImgs');
});
