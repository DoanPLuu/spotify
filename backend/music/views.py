# music/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, StreamingHttpResponse, HttpResponse
from django.shortcuts import get_object_or_404
from .models import Song, Playlist
from .serializers import SongSerializer, PlaylistSerializer
from django.conf import settings
import boto3
import os

USE_S3 = os.getenv('USE_S3', 'False') == 'True'

def file_iterator(file_path, chunk_size=8192):
         try:
             with open(file_path, 'rb') as f:
                 while True:
                     chunk = f.read(chunk_size)
                     if not chunk:
                         break
                     yield chunk
         except FileNotFoundError:
             raise

class SongListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

class SongDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            song = Song.objects.get(pk=pk)
            serializer = SongSerializer(song)
            return Response(serializer.data)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        
class SongStreamView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        if song.is_premium and not request.user.is_premium:
            return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

        if settings.USE_S3:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            try:
                response = s3_client.get_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=song.file_path.name)
                file_stream = response['Body']
                return FileResponse(
                    file_stream,
                    content_type='audio/mpeg',
                    as_attachment=False,
                    filename=f"{song.title}.mp3"
                )
            except s3_client.exceptions.NoSuchKey:
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"S3 streaming error: {e}")
                return Response({"detail": "Error while streaming file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            file_path = song.file_path.path
            if not os.path.exists(file_path):
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            try:
                return FileResponse(
                    open(file_path, 'rb'),
                    content_type='audio/mpeg',
                    as_attachment=False,
                    filename=f"{song.title}.mp3"
                )
            except FileNotFoundError:
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            except PermissionError:
                return Response({"detail": "Permission denied for file"}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                print(f"Streaming error: {e}")
                return Response({"detail": "Error while streaming file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SongDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        if song.is_premium and not request.user.is_premium:
            return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

        if settings.USE_S3:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            try:
                response = s3_client.get_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=song.file_path.name)
                file_stream = response['Body']
                return FileResponse(
                    file_stream,
                    content_type='application/octet-stream',
                    as_attachment=True,
                    filename=f"{song.title}.mp3"
                )
            except s3_client.exceptions.NoSuchKey:
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"S3 download error: {e}")
                return Response({"detail": "Error while downloading file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            file_path = song.file_path.path
            if not os.path.exists(file_path):
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            try:
                return FileResponse(
                    open(file_path, 'rb'),
                    content_type='application/octet-stream',
                    as_attachment=True,
                    filename=f"{song.title}.mp3"
                )
            except FileNotFoundError:
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            except PermissionError:
                return Response({"detail": "Permission denied for file"}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                print(f"Download error: {e}")
                return Response({"detail": "Error while downloading file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SongFavoriteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        if song in request.user.favorite_songs.all():
            request.user.favorite_songs.remove(song)
            return Response({"detail": "Song removed from favorites"})
        request.user.favorite_songs.add(song)
        return Response({"detail": "Song added to favorites"})
        
class PlaylistListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        playlists = Playlist.objects.filter(user=request.user)
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PlaylistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlaylistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            serializer = PlaylistSerializer(playlist)
            return Response(serializer.data)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            serializer = PlaylistSerializer(playlist, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            playlist.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

class PlaylistAddSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            song_id = request.data.get('song_id')
            song = Song.objects.get(pk=song_id)
            playlist.songs.add(song)
            return Response({"detail": "Song added to playlist"})
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

class PlaylistRemoveSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            song_id = request.data.get('song_id')
            song = Song.objects.get(pk=song_id)
            playlist.songs.remove(song)
            return Response({"detail": "Song removed from playlist"})
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)