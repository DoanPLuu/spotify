from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission
from django.shortcuts import get_object_or_404
from .models import Song, Album, Artist
from .serializers import SongSerializer, AlbumSerializer, ArtistSerializer

# Tạo custom permission class
class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

# Artist Admin Views
class AdminArtistListView(APIView):
    permission_classes = [IsSuperUser]
    
    def get(self, request):
        artists = Artist.objects.all()
        serializer = ArtistSerializer(artists, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ArtistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminArtistDetailView(APIView):
    permission_classes = [IsSuperUser]

    def get(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        serializer = ArtistSerializer(artist)
        return Response(serializer.data)

    def put(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        serializer = ArtistSerializer(artist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        # Xóa ảnh từ S3 nếu có
        if artist.image:
            artist.image.delete(save=False)
        artist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Album Admin Views
class AdminAlbumListView(APIView):
    permission_classes = [IsSuperUser]
    
    def get(self, request):
        albums = Album.objects.all()
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AlbumSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminAlbumDetailView(APIView):
    permission_classes = [IsSuperUser]

    def get(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        serializer = AlbumSerializer(album, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        serializer = AlbumSerializer(album, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        # Xóa ảnh bìa từ S3 nếu có
        if album.cover_image:
            album.cover_image.delete(save=False)
        # Cập nhật các bài hát thuộc album này
        Song.objects.filter(album=album).update(album=None)
        album.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Song Admin Views
class AdminSongListView(APIView):
    permission_classes = [IsSuperUser]
    
    def get(self, request):
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SongSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminSongDetailView(APIView):
    permission_classes = [IsSuperUser]

    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        serializer = SongSerializer(song)
        return Response(serializer.data)

    def put(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        serializer = SongSerializer(song, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        # Xóa file âm thanh từ S3 nếu có
        if song.file_path:
            song.file_path.delete(save=False)
        # Xóa file video từ S3 nếu có
        if song.video_file:
            song.video_file.delete(save=False)
        song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
