# music/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, StreamingHttpResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from .models import Song, Playlist, Album, Artist
from .serializers import SongSerializer, PlaylistSerializer, AlbumSerializer, AlbumDetailSerializer, ArtistSerializer
import os
import boto3
from django.conf import settings

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
        try:
            song = Song.objects.get(pk=pk)
        except Song.DoesNotExist:
            print(f"Song with ID={pk} not found")
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

        if song.is_premium and not request.user.is_premium:
            print(f"User {request.user.username} not premium, song ID={pk} is premium")
            return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra xem đang sử dụng S3 hay local storage
        if settings.DEFAULT_FILE_STORAGE == 'storages.backends.s3boto3.S3Boto3Storage':
            # Sử dụng S3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            try:
                presigned_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': song.file_path.name},
                    ExpiresIn=3600  # URL hết hạn sau 1 giờ
                )
                return Response({'stream_url': presigned_url}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"S3 error: {e}")
                return Response({"detail": "Error while generating streaming URL"}, 
                               status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Sử dụng local storage
            file_path = song.file_path.path
            print(f"Checking file: {file_path}")
            if not os.path.exists(file_path):
                print(f"File not found at: {file_path}")
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

            try:
                print(f"Streaming file: {file_path}")
                return FileResponse(
                    open(file_path, 'rb'),
                    content_type='audio/mpeg',
                    as_attachment=False,
                    filename=f"{song.title}.mp3"
                )
            except Exception as e:
                print(f"Streaming error: {e}")
                return Response({"detail": "Error while streaming file"}, 
                               status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SongVideoStreamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            song = Song.objects.get(pk=pk)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

        if song.is_premium and not request.user.is_premium:
            return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

        if not song.video_file:
            return Response({"detail": "No video available"}, status=status.HTTP_404_NOT_FOUND)

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': song.video_file.name},
            ExpiresIn=3600
        )
        return Response({'stream_url': presigned_url}, status=status.HTTP_200_OK)

class SongDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        if song.is_premium and not request.user.is_premium:
            return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra xem đang sử dụng S3 hay local storage
        if settings.DEFAULT_FILE_STORAGE == 'storages.backends.s3boto3.S3Boto3Storage':
            # Sử dụng S3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            try:
                # Tạo URL có attachment disposition để trình duyệt tải xuống
                presigned_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 
                        'Key': song.file_path.name,
                        'ResponseContentDisposition': f'attachment; filename="{song.title}.mp3"'
                    },
                    ExpiresIn=3600  # URL hết hạn sau 1 giờ
                )
                return Response({'download_url': presigned_url}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"S3 error: {e}")
                return Response({"detail": "Error while generating download URL"}, 
                               status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Sử dụng local storage
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
            except Exception as e:
                print(f"Download error: {e}")
                return Response({"detail": "Error while downloading file"}, 
                               status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

# Album Views
class AlbumListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy tất cả album công khai hoặc album của người dùng hiện tại
        albums = Album.objects.filter(Q(is_public=True) | Q(user=request.user))
        serializer = AlbumSerializer(albums, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        # Tạo album mới
        # Thêm user_id vào request.data
        data = request.data.copy()
        data['user_id'] = request.user.id

        serializer = AlbumSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            album = serializer.save()
            return Response(AlbumSerializer(album, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AlbumDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Lấy thông tin chi tiết album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền truy cập: album phải là công khai hoặc thuộc về người dùng hiện tại
            if not album.is_public and album.user != request.user:
                return Response({"detail": "You do not have permission to view this album"}, status=status.HTTP_403_FORBIDDEN)

            serializer = AlbumDetailSerializer(album, context={'request': request})
            return Response(serializer.data)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        # Cập nhật thông tin album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể cập nhật album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to edit this album"}, status=status.HTTP_403_FORBIDDEN)

            serializer = AlbumSerializer(album, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        # Xóa album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể xóa album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to delete this album"}, status=status.HTTP_403_FORBIDDEN)

            # Lấy tất cả các bài hát thuộc album này
            songs = Song.objects.filter(album=album)

            # Cập nhật trường album thành NULL cho tất cả các bài hát
            for song in songs:
                song.album = None
                song.save()

            # Sau đó xóa album
            album.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

# Album Song Management Views
class AlbumAddSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Thêm bài hát vào album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể thêm bài hát vào album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id)
                # Thêm bài hát vào album
                song.album = album
                song.save()
                return Response({"detail": "Song added to album", "song": SongSerializer(song).data})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

class AlbumRemoveSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Xóa bài hát khỏi album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể xóa bài hát khỏi album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id, album=album)
                # Xóa bài hát khỏi album
                song.album = None
                song.save()
                return Response({"detail": "Song removed from album"})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found in this album"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

# Album Song Management Views
class AlbumAddSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Thêm bài hát vào album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể thêm bài hát vào album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id)
                # Thêm bài hát vào album
                song.album = album
                song.save()
                return Response({"detail": "Song added to album", "song": SongSerializer(song).data})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

class AlbumRemoveSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Xóa bài hát khỏi album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể xóa bài hát khỏi album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id, album=album)
                # Xóa bài hát khỏi album
                song.album = None
                song.save()
                return Response({"detail": "Song removed from album"})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found in this album"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

# Favorite Songs Views
class FavoriteSongListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy danh sách bài hát yêu thích của người dùng
        user = request.user
        favorite_songs = user.favorite_songs.all()
        serializer = SongSerializer(favorite_songs, many=True)
        return Response(serializer.data)

class FavoriteSongToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Thêm/xóa bài hát khỏi danh sách yêu thích
        print("FavoriteSongToggleView - POST request received")
        print("Request data:", request.data)
        print("User:", request.user.username)

        song_id = request.data.get('song_id')
        print("Song ID from request:", song_id)

        if not song_id:
            print("Song ID is missing")
            return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            song = Song.objects.get(pk=song_id)
            print("Song found:", song.title)

            user = request.user
            print("User favorite songs count:", user.favorite_songs.count())

            # Kiểm tra xem bài hát đã có trong danh sách yêu thích chưa
            is_favorite = song in user.favorite_songs.all()
            print("Is song already in favorites:", is_favorite)

            if is_favorite:
                # Nếu có, xóa khỏi danh sách yêu thích
                print("Removing song from favorites")
                user.favorite_songs.remove(song)
                return Response({"detail": "Song removed from favorites", "is_favorite": False})
            else:
                # Nếu chưa, thêm vào danh sách yêu thích
                print("Adding song to favorites")
                user.favorite_songs.add(song)
                return Response({"detail": "Song added to favorites", "is_favorite": True})
        except Song.DoesNotExist:
            print("Song not found with ID:", song_id)
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Unexpected error:", str(e))
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CheckFavoriteSongView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Kiểm tra xem bài hát có trong danh sách yêu thích không
        try:
            song = Song.objects.get(pk=pk)
            user = request.user
            is_favorite = song in user.favorite_songs.all()
            return Response({"is_favorite": is_favorite})
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
