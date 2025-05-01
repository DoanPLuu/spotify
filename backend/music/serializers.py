# music/serializers.py
from rest_framework import serializers
from .models import Song, Artist, Album, Playlist
from accounts.serializers import UserSerializer
from rest_framework import serializers

class ArtistSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'image', 'image_url']
        extra_kwargs = {
            'image': {'write_only': True}
        }
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class AlbumSerializer(serializers.ModelSerializer):
    artist_name = serializers.ReadOnlyField(source='artist.name')
    cover_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'artist_name', 'release_date', 'cover_image', 'cover_image_url']
        extra_kwargs = {
            'cover_image': {'write_only': True}
        }
    
    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

class SongSerializer(serializers.ModelSerializer):
    artist_name = serializers.ReadOnlyField(source='artist.name')
    album_title = serializers.ReadOnlyField(source='album.title')
    audio_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'artist_name', 'album', 'album_title', 
                 'duration', 'file_path', 'audio_url', 'cover_image', 'cover_image_url',
                 'is_premium', 'created_at']
        extra_kwargs = {
            'file_path': {'write_only': True},
            'cover_image': {'write_only': True}
        }
    
    def get_audio_url(self, obj):
        if obj.file_path:
            return obj.file_path.url
        return None
        
    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        elif obj.album and obj.album.cover_image:
            return obj.album.cover_image.url
        return None

class AlbumDetailSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    songs = SongSerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    artist_id = serializers.IntegerField(write_only=True, required=False)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'artist_id', 'user_id', 'cover_image', 'release_date', 'created_at', 'songs', 'is_public', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.user == request.user
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
