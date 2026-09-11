# TubeAlfred — YouTube MCP Server: Transcripts, Comments & Channel Data for Claude, ChatGPT & Cursor

```text
https://mcp.tubealfred.com/
```

Paste this into **Claude → Settings → Connectors → Add custom connector**, then sign in. You can also find TubeAlfred in Claude's connector directory.

[TubeAlfred](https://tubealfred.com) brings YouTube transcripts, comments and channel data into Claude, ChatGPT and Cursor. No YouTube API key required.

## Get a YouTube transcript in Claude

After connecting TubeAlfred, try:

> Get the available transcript for this YouTube video: [paste a video URL]. Summarize its five main points and cite the timestamps. If captions are unavailable, tell me rather than guessing.

TubeAlfred is a hosted YouTube MCP server for Claude, ChatGPT, Cursor, Claude Code, and other compatible MCP clients. Retrieve available YouTube transcripts with timestamps, language metadata, and automatic or manual caption tracks. List a channel's videos and retrieve their available transcripts, or explore comments & replies, channel videos/shorts/streams, YouTube search, video details, playlists, and trending. **34 read-only tools.**

Connect Claude in 30 seconds — paste the remote MCP URL or find TubeAlfred in Claude's connector directory, then sign in. No YouTube API key required. No YouTube Data API quota to manage. **100 free credits on signup. Most successful tool calls cost 1 credit.**

## Connection options

- **Hosted MCP:** use `https://mcp.tubealfred.com/` with a compatible remote MCP client and follow the OAuth sign-in flow.
- **npm / stdio bridge (`@tubealfred/mcp`):** connect Claude Desktop, Cursor, Continue, Claude Code, Zed, or another stdio client using a TubeAlfred API key. See the installation options below.

The bridge uses the same TubeAlfred API key as the [REST API](https://tubealfred.com/docs). It does not require a YouTube API key.

## Agent Plugin

This repository is also a portable [Agent Plugin](https://agent-plugins.org/specification). Import or clone the repository root in a compatible client: [`plugin.json`](./plugin.json) identifies the plugin, [`mcp.json`](./mcp.json) connects the hosted Streamable HTTP server, and [`skills/`](./skills/) contains focused video, audience, and discovery research workflows.

Coding agents and contributors should read [`AGENTS.md`](./AGENTS.md) before changing generated contracts, tool metadata, or release files.

## Install

### Claude Desktop one-click extension

Download the latest Desktop Extension:

<https://github.com/tubealfred/mcp/releases/latest/download/tubealfred-youtube.mcpb>

Double-click `tubealfred-youtube.mcpb`, approve the Claude Desktop install prompt, then paste your TubeAlfred API key when prompted. Use this option if you prefer the API-key desktop extension.

For clients using a local stdio server, use the `npx` bridge below.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "tubealfred": {
      "command": "npx",
      "args": ["-y", "@tubealfred/mcp"],
      "env": {
        "TUBEALFRED_API_KEY": "ta_live_..."
      }
    }
  }
}
```

Restart Claude Desktop. The TubeAlfred YouTube tools for video, transcript, comments, replies, related videos, channels, streams, Shorts, playlists, community posts, search, hashtags, suggestions, trending, batch lookups, and URL resolution will appear in the tool list.

### Cursor

Settings → Cursor Settings → MCP → Add new MCP server. Paste the same JSON.

### Continue (VS Code / JetBrains)

In `~/.continue/config.json` (or per-workspace `config.yaml`):

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@tubealfred/mcp"],
          "env": { "TUBEALFRED_API_KEY": "ta_live_..." }
        }
      }
    ]
  }
}
```

### Claude Code

```bash
claude mcp add tubealfred -- npx -y @tubealfred/mcp
```

Then export the key in the same shell:

```bash
export TUBEALFRED_API_KEY=ta_live_...
```

### Smithery

```bash
npx -y @smithery/cli install tubealfred/youtube --client claude
```

Smithery prompts for the API key and writes the config for you.

## Configuration

| Env var | Required | Description |
| --- | --- | --- |
| `TUBEALFRED_API_KEY` | yes | Your TubeAlfred team key. Create at [tubealfred.com/app/api-keys](https://tubealfred.com/app/api-keys). |
| `TUBEALFRED_MCP_URL` | no | Override the upstream MCP URL. Defaults to `https://mcp.tubealfred.com/`. |

## What you get

Every public tool published at `mcp.tubealfred.com` appears in your MCP client. The current 34-tool inventory, REST operation mapping, parameters, costs, and visibility are published in the [versioned operation manifest](https://tubealfred.com/.well-known/tubealfred-youtube-operations.v1.json); MCPB metadata is generated from its public capability set.

<!-- public-tools:start -->
| Tool | What it does |
| --- | --- |
| `youtube_channel_get` |  |C |h |a | | |e |l |  |d |e |t |a |i |l |s | |
| `youtube_channel_about` |  |C |h |a | | |e |l |  |a |b |o |u |t | |
| `youtube_channel_videos` |  |C |h |a | | |e |l |  |v |i |d |e |o |s | |
| `youtube_channel_videos_page` |  |C |h |a | | |e |l |  |v |i |d |e |o |s |  |p |a |g |e | |
| `youtube_channel_streams` |  |C |h |a | | |e |l |  |l |i |v |e |  |s |t | |e |a |m |s | |
| `youtube_channel_streams_page` |  |C |h |a | | |e |l |  |l |i |v |e |  |s |t | |e |a |m |s |  |p |a |g |e | |
| `youtube_channel_shorts` |  |C |h |a | | |e |l |  |s |h |o | |t |s | |
| `youtube_channel_shorts_page` |  |C |h |a | | |e |l |  |s |h |o | |t |s |  |p |a |g |e | |
| `youtube_channel_playlists` |  |C |h |a | | |e |l |  |p |l |a |y |l |i |s |t |s | |
| `youtube_channel_playlists_page` |  |C |h |a | | |e |l |  |p |l |a |y |l |i |s |t |s |  |p |a |g |e | |
| `youtube_channel_community` |  |C |h |a | | |e |l |  |c |o |m |m |u | |i |t |y |  |p |o |s |t |s | |
| `youtube_channel_community_page` |  |C |h |a | | |e |l |  |c |o |m |m |u | |i |t |y |  |p |o |s |t |s |  |p |a |g |e | |
| `youtube_playlist_metadata` |  |P |l |a |y |l |i |s |t |  |m |e |t |a |d |a |t |a | |
| `youtube_playlist_get` |  |P |l |a |y |l |i |s |t |  |c |o | |t |e | |t |s | |
| `youtube_playlist_page` |  |P |l |a |y |l |i |s |t |  |p |a |g |e | |
| `youtube_search_suggest` |  |S |e |a | |c |h |  |s |u |g |g |e |s |t |i |o | |s | |
| `youtube_search_hashtag` |  |H |a |s |h |t |a |g |  |s |e |a | |c |h | |
| `youtube_search_hashtag_page` |  |H |a |s |h |t |a |g |  |s |e |a | |c |h |  |p |a |g |e | |
| `youtube_search_page` |  |S |e |a | |c |h |  |p |a |g |e | |
| `youtube_trending` |  |T | |e | |d |i | |g |  |v |i |d |e |o |s | |
| `youtube_trending_shorts` |  |T | |e | |d |i | |g |  |S |h |o | |t |s | |
| `youtube_video_get` |  |V |i |d |e |o |  |d |e |t |a |i |l |s | |
| `youtube_video_enhanced` |  |E | |h |a | |c |e |d |  |v |i |d |e |o |  |d |e |t |a |i |l |s | |
| `youtube_comments_list` |  |V |i |d |e |o |  |c |o |m |m |e | |t |s | |
| `youtube_comments_page` |  |V |i |d |e |o |  |c |o |m |m |e | |t |s |  |p |a |g |e | |
| `youtube_replies_list` |  |C |o |m |m |e | |t |  | |e |p |l |i |e |s | |
| `youtube_replies_page` |  |C |o |m |m |e | |t |  | |e |p |l |i |e |s |  |p |a |g |e | |
| `youtube_related_videos` |  |R |e |l |a |t |e |d |  |v |i |d |e |o |s | |
| `youtube_related_videos_page` |  |R |e |l |a |t |e |d |  |v |i |d |e |o |s |  |p |a |g |e | |
| `youtube_video_transcript` |  |V |i |d |e |o |  |t | |a | |s |c | |i |p |t |  |f |a |s |t | |
| `youtube_url_resolve` |  |R |e |s |o |l |v |e |  |U |R |L | |
| `youtube_videos_batch` |  |B |a |t |c |h |  |v |i |d |e |o |  |d |e |t |a |i |l |s | |
| `youtube_channels_batch` |  |B |a |t |c |h |  |c |h |a | | |e |l |  |d |e |t |a |i |l |s | |
| `youtube_search_query` |  |S |e |a | |c |h | |
<!-- public-tools:end -->

Full pricing details: <https://tubealfred.com/pricing.md>.

## License

MIT
