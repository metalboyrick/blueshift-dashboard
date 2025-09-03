const [langCode] = process.argv.slice(2);

const langMap = {
  fr: 'French',
  vi: 'Vietnamese',
  'zh-CN': 'Simplified Chinese',
  'zh-HK': 'Traditional Chinese',
  id: 'Indonesian',
  uk: 'Ukrainian',
  de: 'German',
};

console.log(langMap[langCode] || langCode);
