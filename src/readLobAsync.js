module.exports = lob => new Promise((resolve, reject) => {
  const chunks = [];
  lob.setEncoding('utf8');
  lob.on('close', () => resolve(chunks.join('')));
  lob.on('error', reject);
  lob.on('readable', () => {
    const chunk = lob.read();
    chunks.push(chunk);
  });
});
