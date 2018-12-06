import pylast
import pandas as pd
import numpy as np
import datetime

API_KEY = "a66e2f168fdbcda137799a2c165678ee"
API_SECRET = "0472282104fce606c4d59bd659a66397"

# In order to perform a write operation you need to authenticate yourself
username = 'philosiphicus'
password_hash = 'f22ec97b78a7ebf61bf26c6a0cedf014'

network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET,
                               username=username, password_hash=password_hash)
user = network.get_user(username)
start_date = datetime.datetime(2018, 1, 1, 0, 0, 0).strftime('%s')
end_date = datetime.datetime(2019, 1, 1, 0, 0, 0).strftime('%s')

total_tracks = []
recent_tracks = user.get_recent_tracks(limit=1000, time_from=start_date)
total_tracks.extend(recent_tracks)
while (True):
    recent_tracks = user.get_recent_tracks(limit=1000, time_from=start_date, time_to=recent_tracks[len(recent_tracks)-1].timestamp)
    if (not recent_tracks):
        break
    total_tracks.extend(recent_tracks)

    # print(recent_tracks[len(recent_tracks)-1])
    print(len(total_tracks))

to_csv = pd.DataFrame(columns=['artist', 'album', 'track', 'listen_date'])
for index, t in enumerate(total_tracks):
    to_csv.loc[index] = {
        'artist': t.track.artist.name,
        'album': t.album,
        'track' : t.track.title,
        'listen_date' : t.playback_date
    }
    print(index)

to_csv.to_csv('/Users/nick/Desktop/music data/output_12-5-18-10-45-41.csv', header=False, index=False)


# music_csv_path = r'/Users/nick/Desktop/philosiphicus.csv'
# music_csv_names = ['artist', 'album', 'song', 'listen_date']
# music_csv = pd.read_csv(music_csv_path, names=music_csv_names)
# music_csv['genre'] = ''
# # print(music_csv)
# artists = {}
# for idx, row in music_csv.iterrows():
#     artist = row['artist']
#     if artist not in artists.keys():
#         print(artist)
#         try:
#             artists[artist] = genre_tags = [str(item[0]) for item in network.get_artist(row['artist']).get_top_tags(5)]
#         except:
#             print(artist + ' not found')
#             continue

#     music_csv.at[idx, 'genre'] = ','.join(artists[artist])

# music_csv.to_csv('/Users/nick/Desktop/output_with_genre.csv')