<p align="center">
    <br>
    <a href="https://curationcorp.com" target="_blank">
    <img src="curationlogo.png"/>
    </a>
    <br>
</p>

<h1 align="center">Curation API</h1>

Developers can use a subset of the same API that powers app.curationcorp.com to augment their own applications with Curation data. Curation's customer API exclusively uses [GraphQL](https://graphql.org/) to enable our customers to declaratively specify exactly what they require, deeply nested in a single request. We've found using GraphQL massively speeds up our internal development, and is a really helpful way of expresssing and  querying deeply nested data. 

Whilst you can simply append the query as a standard HTTP POST body (see [Examples](./examples/index.js)), for production uses we recommend using a GraphQL client such as [Apollo Link](https://github.com/apollographql/apollo-link).

## Quickstart 
Clone this repository, `npm install`, then `cd examples`and run `node index.js` with `EMAIL_ADDRESS` and `PASSWORD` environment variables specified. This authenticates with Curation API, retrieves the user's API key and boots a small Express server that listens for connections to `localhost:3000/stories` and returns a JSON object of stories grouped by theme for your account. 

## Authentication
Users are via an API key which can either be provided by your Curation representative, or extracted from a successful login response. See [Examples](./examples/index.js) for an implementation of the latter. 

## Rate limiting
API users are rate-limited to prevent abuse. Users that fall foul of the rate limiting will receive a `HTTP 429` response.

## API Endpoint
The API can be accessed at `https://app.curationcorp.com/api/graphql`.

## Reference

### Query
The base query type. 

### Article
A curated news article. 

```
type Article implements GenericArticle {
    Comments: [Comment]
    ArticleId: ID!
    Title: String
    Body: String
    StoryDate: DateTime
    PublishedDate: DateTime
    Tags: [Tag]
    Related(limit: Int): [Article]
    Sources: [Source]
    CurationComment: String
  }
```

### Tag 
A Tag applied by the Curator to an article. 
```
type Tag {
    TagId: ID!                  // The unique indentifier of the Tag
    Name: String                // The Tag's name
    Articles(                   // Articles that have been tagged with the Tag
      limit: Int
      offset: Int
      StoryDate: DateTime
      PublishedDate: DateTime
    ): [Article]
    TagType: String             //One of "Company", "Geography", "Sector", "Topic"
  }
```

### Theme

``` 
type Theme  {
    Articles(
      limit: Int
      offset: Int
      PublishedDate: DateTime
      Rating: Int
      Type: ArticleType
    ): [Article]                //Articles that fall under the theme
    Name: String                //The Name of the theme. 
    Tags: [Tag]                 //The tags that make up the theme.
    ThemeId: ID!                //The unique identifier of the theme.
  }
```
