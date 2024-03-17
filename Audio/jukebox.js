function playback(url) {
  var a = new Audio(url);
  a.play();
}

async function fetchAndPlayAudio(searchQuery) {
  const apiUrl = `https://spotify81.p.rapidapi.com/download_track?q=${encodeURIComponent(searchQuery)}&onlyLinks=1`;
  const apiKey = '704d5c2221msh1b8993145546ac3p1ae21ajsn48ae9a8e7fae';

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'spotify81.p.rapidapi.com',
    },
  };
  try {
    const response = await fetch(apiUrl, options);
    const audioLinks = await response.json();
    if (audioLinks && audioLinks.length > 0) {
      playback(audioLinks[0]['url']);
    }
  } catch (error) {
    console.error(error);
  }
}



