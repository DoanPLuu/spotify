# music/serializers.py
from rest_framework import serializers
from .models import Song, Artist, Album, Playlist
from accounts.serializers import UserSerializer

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'cover_image', 'created_at']

class AlbumSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'cover_image', 'release_date', 'created_at']

class SongSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    album = AlbumSerializer(read_only=True)
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'album', 'duration', 'file_path', 'cover_image', 'is_premium', 'created_at', 'is_favorited',]

    def get_is_favorited(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.favorited_by.filter(id=user.id).exists()
        return False

class PlaylistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    songs = SongSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'user', 'songs', 'cover_image', 'is_public', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Playlist name cannot be empty.")
        return value