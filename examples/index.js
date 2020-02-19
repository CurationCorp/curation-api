const { post } = require("axios");
const express = require("express");
const bodyparser = require("body-parser");
const app = new express();
app.use(bodyparser.json({ extended: true }));
const email = process.env.EMAIL_ADDRESS;
const password = process.env.PASSWORD;
const BASE_URL =  "https://app.curationcorp.com/api";


if (!email || !password){
  console.error('Specify EMAIL_ADDRESS and PASSWORD as environment variables')
  process.exit(1)
}

let ApiKey = ''; 
const getApiKey = async () => {
  try {
    const login = await post(`${BASE_URL}/login`, {
      email,
      password
    });
    if (login.data && login.status === 200) {
      console.log(`using API key ${login.data.ApiKey}`)
      ApiKey = login.data.ApiKey;
    }
  } catch (e) {
    console.error(`login failed: ${e}`);
  }
};

getApiKey();

app.get("/stories", async (req, res) => {
  try {
    console.log(`Bearer ${ApiKey}`)
    const { data } = await post(
      `${BASE_URL}/graphql`,
      {
        query: `{
        themes {
          Name 
          Articles { 
            Title 
          }
         }
       }`
      },
      { headers: { Authorization: `Bearer ${ApiKey}` } }
    );
    res.send({ stories: data });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.listen(3000, () => "app booted");
