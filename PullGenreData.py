import pylast
import pandas as pd
import numpy as np
import datetime

API_KEY = "a66e2f168fdbcda137799a2c165678ee"
API_SECRET = "0472282104fce606c4d59bd659a66397"

# In order to perform a write operation you need to authenticate yourself
username = 'philosiphicus'
password_hash = 'f22ec97b78a7ebf61bf26c6a0cedf014'

year = 2018

network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET,
                               username=username, password_hash=password_hash)
user = network.get_user(username)
start_date = datetime.datetime(year, 1, 1, 0, 0, 0).strftime('%s')
end_date = datetime.datetime(year, 12, 31, 23, 59, 59).strftime('%s')

total_tracks = []
recent_tracks = user.get_recent_tracks(limit=1000, time_from=start_date, time_to = end_date)
total_tracks.extend(recent_tracks)
while (True):
    recent_tracks = user.get_recent_tracks(limit=1000, time_from=start_date, time_to=recent_tracks[len(recent_tracks)-1].timestamp)
    if (not recent_tracks):
        break
    total_tracks.extend(recent_tracks)

    # print(recent_tracks[len(recent_tracks)-1])
    print(len(total_tracks))

to_csv = pd.DataFrame(columns=['artist', 'album', 'track', 'listen_date', 'genre'])
artist_genres = {}


for index, t in enumerate(total_tracks):
    artist_name = t.track.artist.name
    if artist_name not in artist_genres:
        genre_list = t.track.artist.get_top_tags(limit=10)
        genres = [g.item.get_name() for g in genre_list]
        artist_genres[artist_name] = genres
    else:
        genres = artist_genres[artist_name]

    # artists[artist] = genre
    to_csv.loc[index] = {
        'artist': artist_name,
        'album': t.album,
        'track': t.track.title,
        'listen_date': t.playback_date,
        'genre': ','.join(genres)
    }
    print(index)

to_csv.to_csv('/Users/nick/Desktop/music data/{0}.csv'.format(datetime.datetime.now().strftime('%d%b%Y_%H%M%S')), header=True, index=False)