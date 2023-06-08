import pylast
import numpy as np
import datetime
import json
import pymongo

with open('credentials.json') as data_file:
    creds = json.load(data_file)

pwd =  data['password']

print(user)
print(pwd)

API_KEY = creds['API_KEY']
API_SECRET = creds['API_SECRET']

# In order to perform a write operation you need to authenticate yourself
username = creds['username']
password_hash = creds['password_hash']

# year = 2019

network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET,
                               username=username, password_hash=password_hash)
user = network.get_user(username)
user_registered_time = user.get_unixtime_registered()

client = pymongo.MongoClient(creds['mongo_server'])
db = client.musicdb

to_csv = pd.DataFrame(columns=['artist', 'album', 'track', 'listen_date'])


artists = db.artists
tracks = db.tracks

start_date = user_registered_time
# start_date = datetime.date(2019, 7, 1).strftime('%s')
# start_date = tracks.find().sort([('listen_date', -1)]).limit(1)[0]['listen_date'].strftime('%s')
end_date = datetime.datetime.now().strftime('%s')
# end_date = datetime.date(2019, 7, 26).strftime('%s')
total_tracks = []
recent_tracks = []
# recent_tracks = user.get_recent_tracks(limit=1000, time_from=start_date, time_to=end_date)
# total_tracks.extend(recent_tracks)
while (True):
    recent_tracks = user.get_recent_tracks(
        limit=1000, time_from=start_date, time_to=(recent_tracks[-1].timestamp if recent_tracks else end_date))
    if (not recent_tracks):
        break
    total_tracks.extend(recent_tracks)

    # print(recent_tracks[len(recent_tracks)-1])
    print(datetime.datetime.utcfromtimestamp(int(recent_tracks[-1].timestamp)).strftime('%D %H:%M:%S'))
print(len(total_tracks))



artist_list = artists.distinct('name')
track_list = list(tracks.aggregate( [ {"$group": { "_id": { 'track':"$track", 'listen_date': "$listen_date" } } } ] ));

for index, t in enumerate(total_tracks):
    artist_name = t.track.artist.name
    track_playback_date = datetime.datetime.strptime(t.playback_date, '%d %b %Y, %H:%M')

    if artist_name not in artist_list:
        artist_list.append(artist_name)
        genre_list = t.track.artist.get_top_tags(limit=10)
        genres = [g.item.get_name() for g in genre_list]
        artists.insert_one({
            'name': artist_name,
            'genres': genres
        })
        print(f'Added {artist_name} to database.')
    else:
        print(f'{artist_name} already present in the database.')

    try:
        track_index = track_list.index({'_id': {'track': t.track.title, 'listen_date': track_playback_date}})
    except ValueError:
        track_index = False;

    if track_index is False:
        track_list.append({ "_id": { 'track': t.track.title, 'listen_date': track_playback_date} })
        print(f'Adding {t.track.title}, listened to on {t.playback_date}.')
        tracks.insert_one({
            'artist': artist_name,
            'album': t.album,
            'track': t.track.title,
            'listen_date': track_playback_date
        })
    else:
        print(f'Artist {artist_name} play at {t.playback_date} already recorded in database.')

    # if artist_name not in added_artists:
    #     added_artists.append(artist_name)
    #     artist_list.append({
    #         'name': artist_name,
    #         'genres': genres
    #     })
    # to_csv.loc[index] = {
    #     'artist': artist_name,
    #     'album': t.album,
    #     'track': t.track.title,
    #     'listen_date': t.playback_date
    # }

# to_csv.to_csv('/Users/nick/Dropbox (Personal)/oxfordcomma.github.io/{0}.csv'.format(datetime.datetime.now().strftime('%d%b%Y_%H%M%S')), header=True, index=False)