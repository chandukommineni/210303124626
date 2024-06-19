const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const THIRD_PARTY_API_URL = "http://20.244.56.114/";
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4Nzc4MDcwLCJpYXQiOjE3MTg3Nzc3NzAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjFjNzhiNTYyLTg4N2YtNDlhZi04Mjc1LWQwYzdjNWZmY2M1ZiIsInN1YiI6IjIxMDMwMzEyNDYyNkBwYXJ1bHVuaXZlcnNpdHkuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJBZmZvcmRNZWRUZWNoIiwiY2xpZW50SUQiOiIxYzc4YjU2Mi04ODdmLTQ5YWYtODI3NS1kMGM3YzVmZmNjNWYiLCJjbGllbnRTZWNyZXQiOiJoVmFwY0FXUVJiWHp4aFZMIiwib3duZXJOYW1lIjoiS09NTUlORU5JIENIQU5EVSIsIm93bmVyRW1haWwiOiIyMTAzMDMxMjQ2MjZAcGFydWx1bml2ZXJzaXR5LmFjLmluIiwicm9sbE5vIjoiMjEwMzAzMTI0NjI2In0.sBar-EDj1ThYTm0OtN82Tikd_q8VhrBpGmDUR40rj9M";


let storedNumbers = [];

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`${THIRD_PARTY_API_URL}${type}`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      timeout: 500
    });
    if (response.status === 200) {
      return response.data.numbers || [];
    }
  } catch (error) {
    console.log(error)
    return [];
  }
  return [];
};

app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  let windowPrevState, windowCurrState, newNumbers;

  try {
    windowPrevState = [...storedNumbers];
    newNumbers = await fetchNumbers(type);

    
    const uniqueNewNumbers = newNumbers.filter(num => !storedNumbers.includes(num));


    uniqueNewNumbers.forEach(num => {
      if (storedNumbers.length >= WINDOW_SIZE) {
        storedNumbers.shift();
      }
      storedNumbers.push(num);
    });

    windowCurrState = [...storedNumbers];
    const avg = storedNumbers.length ? (storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length) : 0;

    const response = {
      windowPrevState,
      windowCurrState,
      numbers: newNumbers,
      avg: avg.toFixed(2)
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
