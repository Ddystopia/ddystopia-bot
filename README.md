##### `yarn / npm i to install modules`

### `You must create these files:`

- config.json

```json
{
  "token": "token",
  "prefix": "prefix",
  "bannedChannels": ["id", "id"],// Channels, where bot not listening commands
  "imageChannels": ["id", "id"],// Channels, where bot give money for images
  "nonGrata": ["id", "id"],// Users ignored by the bot
  "wordsGameChannels": ["id", "id"],// Channels to play in words
  "levelingRoles": { // Roles by level
		"level":"roleId",
		"level2":"roleId",
	}
}
```

- redditConfig.json

```json
{
  "username": "reddit_username",
  "password": "reddit password",
  "app_id": "reddit api app id",
  "api_secret": "reddit api secret",
  "logs": true // specify this if you want logs from this package
}
```
