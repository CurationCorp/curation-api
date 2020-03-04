//scrape the history of articles your account has access to. 
const { post } = require("axios");
const email = process.env.EMAIL_ADDRESS;
const password = process.env.PASSWORD;
const BASE_URL = "https://app.curationcorp.com/api";
const { writeFileSync } = require("fs");

if (!email || !password) {
  console.error("Specify EMAIL_ADDRESS and PASSWORD as environment variables");
  process.exit(1);
}

const getApiKey = async () => {
  try {
    const login = await post(`${BASE_URL}/login`, {
      email,
      password
    });
    if (login.data && login.status === 200) {
      console.log(`using API key ${login.data.ApiKey}`);
      return login.data.ApiKey;
    }
  } catch (e) {
    console.error(`login failed: ${e}`);
  }
};

async function main() {
  let ApiKey;
  ApiKey = await getApiKey();
  const themes = await getThemes(ApiKey);
  for (const theme of themes) {
    const articles = await getAllArticlesForTheme(ApiKey, theme);
    writeFileSync(`./output/${encodeURI(theme.Name)}.json`, JSON.stringify(articles));
  }
}

main();

async function getThemes(ApiKey) {
  const {
    data: {
      data: { themes }
    }
  } = await post(
    `${BASE_URL}/graphql`,
    {
      query: `{
          themes {
            Name 
            ThemeId
           }
         }`
    },
    { headers: { Authorization: `Bearer ${ApiKey}` } }
  );
  return themes;
}

async function getAllArticlesForTheme(ApiKey, theme) {
  let articlesInLastResponse = 100;
  let offset = 0;
  const articles = [];
  while (articlesInLastResponse === 100) {
    try {
      const query = `
        {
            theme(ThemeId:"${theme.ThemeId}"){
                Articles(limit:100 offset:${offset}){
                    ArticleId
                    Title
                    Body
                    Sources {
                        Title
                        Url
                        SourceId
                    }
                    PublishedDate
                    StoryDate
                    Tags {
                        TagId
                        Name
                        TagType
                    }
                }
            }
        }  
      `;
      const res = await post(
        `${BASE_URL}/graphql`,
        {
          query
        },
        {
          headers: { Authorization: `Bearer ${ApiKey}` }
        }
      );
      articles.push(...res.data.data.theme.Articles);
      articlesInLastResponse = res.data.data.theme.Articles.length;
      offset = offset + articlesInLastResponse;
      console.log(`currently articles ${articles.length} into ${theme.Name}`)
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log(`found ${articles.length} for ${theme.Name}....proceeding to write`)
  return articles;
}
