# Data you could use

The default is to **invent data** for your idea (step 3). But you are not limited to made-up or class data: any public data on the web can go into your database. Below are real datasets, each a direct link to CSV files. You do not download anything: give the link(s) to the AI and ask it to write `db/load.js`, which fetches the CSV from the link and loads it into your `<NetID>_myapp` database.

## Real data, ready to load (direct CSV links)

| Data | Tables (they connect on) | Size | Links |
| --- | --- | --- | --- |
| Himalayan climbing expeditions | peaks, expeditions, members (`peak_id`, `expedition_id`) | 10 MB | [peaks](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2020/2020-09-22/peaks.csv), [expeditions](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2020/2020-09-22/expeditions.csv), [members](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2020/2020-09-22/members.csv) |
| Tate art collection | artists, artworks (`artists.id` = `artwork.artistId`) | 25 MB | [artists](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2021/2021-01-12/artists.csv), [artwork](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2021/2021-01-12/artwork.csv) |
| Board games (BoardGameGeek) | ratings, details (`id`) | 40 MB | [ratings](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2022/2022-01-25/ratings.csv), [details](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2022/2022-01-25/details.csv) |
| Spotify songs | one table: tracks, artists, albums, playlists, audio features (split it into tables) | 8 MB | [spotify_songs](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2020/2020-01-21/spotify_songs.csv) |
| Netflix titles | one table: titles, directors, cast, countries (split it into tables) | 3 MB | [netflix_titles](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2021/2021-04-20/netflix_titles.csv) |
| Movies and the Bechdel test (FiveThirtyEight) | one table: movies, budgets, grosses, test result | 0.2 MB | [movies](https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv) |
| Palmer penguins | one table: species, island, measurements | 15 KB | [penguins](https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2020/2020-07-28/penguins.csv) |

Example prompt: *"Read AGENTS.md. Write db/load.js that fetches these CSV files from their links, designs tables with keys for them, creates [my NetID]_myapp, and loads the rows: [paste links]."*

## Where to find more

| Source | What is there |
| --- | --- |
| [TidyTuesday](https://github.com/rfordatascience/tidytuesday) | A new dataset every week since 2018, many with several files |
| [FiveThirtyEight](https://github.com/fivethirtyeight/data) | Hundreds of datasets behind news stories |
| [Seattle Open Data](https://data.seattle.gov) | City data: permits, pet licenses, 911 calls, parks |
| [data.gov](https://catalog.data.gov) | US federal data |

## Already on the class server

`olist` (online store), `stackexchange` (questions and answers), `gtfs` (King County Metro schedules). Read-only: query them directly from your app.
