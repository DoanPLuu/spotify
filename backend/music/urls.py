# music/urls.py
from django.urls import path

from music.admin_views import AdminAlbumDetailView, AdminAlbumListView, AdminArtistDetailView, AdminArtistListView, AdminSongDetailView, AdminSongListView
from .views import (
    SongListView, SongDetailView, SongStreamView, SongDownloadView,
    PlaylistListView, PlaylistDetailView, PlaylistAddSongView, PlaylistRemoveSongView,
    AlbumListView, AlbumDetailView, AlbumAddSongView, AlbumRemoveSongView,
    FavoriteSongListView, FavoriteSongToggleView, CheckFavoriteSongView, SongVideoStreamView
)

urlpatterns = [
    # Song endpoints
    path('songs/', SongListView.as_view(), name='song-list'),
    path('songs/<int:pk>/', SongDetailView.as_view(), name='song-detail'),
    path('songs/<int:pk>/stream/', SongStreamView.as_view(), name='song-stream'),
    path('songs/<int:pk>/download/', SongDownloadView.as_view(), name='song-download'),
    path('songs/<int:pk>/video-stream/', SongVideoStreamView.as_view(), name='song-video-stream'),

    # Playlist endpoints
    path('playlists/', PlaylistListView.as_view(), name='playlist-list'),
    path('playlists/<int:pk>/', PlaylistDetailView.as_view(), name='playlist-detail'),
    path('playlists/<int:pk>/add-song/', PlaylistAddSongView.as_view(), name='playlist-add-song'),
    path('playlists/<int:pk>/remove-song/', PlaylistRemoveSongView.as_view(), name='playlist-remove-song'),

    # Album endpoints
    path('albums/', AlbumListView.as_view(), name='album-list'),
    path('albums/<int:pk>/', AlbumDetailView.as_view(), name='album-detail'),
    path('albums/<int:pk>/add-song/', AlbumAddSongView.as_view(), name='album-add-song'),
    path('albums/<int:pk>/remove-song/', AlbumRemoveSongView.as_view(), name='album-remove-song'),

    # Favorite songs endpoints
    path('favorites/', FavoriteSongListView.as_view(), name='favorite-list'),
    path('favorites/toggle/', FavoriteSongToggleView.as_view(), name='favorite-toggle'),
    path('favorites/check/<int:pk>/', CheckFavoriteSongView.as_view(), name='favorite-check'),

    # Admin endpoints
    path('admin/artists/', AdminArtistListView.as_view(), name='admin_artist_list'),
    path('admin/artists/<int:pk>/', AdminArtistDetailView.as_view(), name='admin_artist_detail'),
    path('admin/albums/', AdminAlbumListView.as_view(), name='admin_album_list'),
    path('admin/albums/<int:pk>/', AdminAlbumDetailView.as_view(), name='admin_album_detail'),
    path('admin/songs/', AdminSongListView.as_view(), name='admin_song_list'),
    path('admin/songs/<int:pk>/', AdminSongDetailView.as_view(), name='admin_song_detail'),
]