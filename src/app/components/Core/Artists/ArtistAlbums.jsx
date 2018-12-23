import React from 'react';
import AlbumPanel from '../Albums/AlbumPanel';
import Loader from '../../common/Loader';
import PageTitle from '../../common/PageTitle';
import PageContent from '../Layout/PageContent';

export default class ArtistAlbums extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      artist: null,
    };
  }

  async componentDidMount() {
    const music = MusicKit.getInstance();

    const { id } = this.props;
    const isCatalog = /^\d+$/.test(id);

    let artist;
    if (isCatalog) {
      artist = await music.api.artist(id, { include: 'albums' });
    } else {
      artist = await music.api.library.artist(id, { include: 'albums' });
    }

    this.setState({
      artist,
    });
  }

  renderArtists() {
    const { artist } = this.state;

    return artist.relationships.albums.data.map(album => (
      <AlbumPanel key={album.id} album={album} />
    ));
  }

  renderContent() {
    const { artist } = this.state;

    if (!artist) {
      return <Loader />;
    }

    return (
      <>
        <PageTitle title={artist.attributes.name} context={'My Library'} />
        {this.renderArtists()}
      </>
    );
  }

  render() {
    return <PageContent>{this.renderContent()}</PageContent>;
  }
}
