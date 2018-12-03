import React from 'react';
import addImage from '../assets/Add.png';

import styles from './SongList.scss';

export default class SongList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSong: '',
      isPlaying: false
    }

    this.onMediaItemDidChange = this.onMediaItemDidChange.bind(this);
    this.playbackStateDidChange = this.playbackStateDidChange.bind(this);
  }

  onMediaItemDidChange(event) {
    this.setState({
      currentSong: event.item.id
    })
  }

  playbackStateDidChange(_) {
    const music = MusicKit.getInstance();
    this.setState({
      isPlaying: music.player.isPlaying,
    });
  };

  componentDidMount() {
    const music = MusicKit.getInstance();
    music.addEventListener(
      MusicKit.Events.mediaItemDidChange,
      this.onMediaItemDidChange,
    );
    music.addEventListener(
      MusicKit.Events.playbackStateDidChange,
      this.playbackStateDidChange,
    );
  }
  componentWillUnmount() {
    const music = MusicKit.getInstance();
    music.removeEventListener(
      MusicKit.Events.mediaItemDidChange,
      this.onMediaItemDidChange,
    );
    music.removeEventListener(
      MusicKit.Events.playbackStateDidChange,
      this.playbackStateDidChange,
    );
  }

  render() {
    return (
      <table className={styles.songList}>
        <thead>
          <tr>
            <th width="100">Song</th>
            <th width="300">Artist</th>
            <th width="100">Album</th>
            <th width="100">Time</th>
          </tr>
        </thead>
        <tbody>
          {this.props.songs.map((song, i) => {
            const id = song.attributes.playParams.catalogId == undefined ?
              song.attributes.playParams.id :
              song.attributes.playParams.catalogId;
            return <SongListItem key={i} song={song} index={i}
              songs={this.props.songs}
              albumArt={!this.props.album}
              isPlaying={id == this.state.currentSong && this.state.isPlaying} />
          }
          )}
        </tbody>
      </table>
    );
  }
}

class SongListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      setQueue: false
    }

    const SIZE = 30;

    this.imageUrl = MusicKit.formatArtworkURL(this.props.song.attributes.artwork, SIZE, SIZE);
    this.explicit = <React.Fragment />; // TODO: get if the song is explicit or not
    this.inLibrary = this.props.song.attributes.playParams.isLibrary ?
      <React.Fragment /> :
      <img src={addImage} />; // If the song is already in the library or not
    this.time = this.getTime(this.props.song.attributes.durationInMillis);
    this.imageOrNumber = this.props.albumArt ?
      <div className={"play-overlay"}><img src={this.imageUrl} alt="" /></div> :
      <div className={"play-overlay"}><h3>{this.props.song.attributes.trackNumber}</h3></div>;

    this._playSong = this._playSong.bind(this);
    this._pauseSong = this._pauseSong.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  async _playSong() {
    let music = MusicKit.getInstance();
    if (!this.state.setQueue) {
      await music.setQueue({
        startPosition: this.props.index,
        items: this.props.songs,
      });
      this.setState({
        setQueue: true
      });
    }
    await music.play();
  }
  _pauseSong() {
    const music = MusicKit.getInstance();
    music.player.pause();
  }

  _handleClick() {
    if (this.state.isPlaying) {
      this._pauseSong();
    } else {
      this._playSong();
    }
  }


  getTime(ms) {
    ms = 1000 * Math.round(ms / 1000); // round to nearest second
    let d = new Date(ms);
    return d.getUTCMinutes() + ':' + String('0' + d.getUTCSeconds()).slice(-2); // gets a nice minutes and seconds formatting of the time
  }

  render() {
    const songAttributes = this.props.song.attributes;
    return (
      <tr onClick={this._handleClick} className={`test-overlay ${this.props.isPlaying ? 'pause' : ''}`} >
        <td> {/* Song Name, icon, explicit */}
          <div className={styles.songTitleWrapper}>
            <div>
              {this.imageOrNumber}
            </div>
            <div>
              <span className={styles.songName}>{songAttributes.name}</span>
              {this.explicit}
            </div>
          </div>
        </td>
        <td> {/* Artist Name */}
          <span>{songAttributes.artistName}</span>
        </td>
        <td> {/* Album Name and add to library */}
          <div className={styles.albumName}>
            <span>{songAttributes.albumName}</span>
            <span>{this.inLibrary}</span> {/* If it is not in the users library, then it will just show an image to add to library  */}
          </div>
        </td>
        <td> {/* Time or menu button */}
          <span>{this.time}</span>
        </td>
      </tr>
    );
  }
}
