import { useState } from 'react'
import { useEffect } from 'react'
import './SongItem.css'

const SongItem = props => {

    const [bpm, setBpm] = useState();
    const [key, setKey] = useState();

    const pitchToCamelotDictionary = {
        '01':'8B',
		'11':'3B',
		'21':'10B',
		'31':'5B',
		'41':'12B',
		'51':'7B',
		'61':'2B',
		'71':'9B',
		'81':'4B',
		'91':'11B',
		'101':'6B',
		'111':'1B',
		'00':'5A',
		'10':'12A',
		'20':'7A',
		'30':'2A',
		'40':'9A',
		'50':'4A',
		'60':'11A',
		'70':'6A',
		'80':'1A',
		'90':'8A',
		'100':'3A',
		'110':'10A'
    }

    useEffect(() => {
        if (props.tracksArrayData && props.tracksArrayData.length) {
            let found;
            found = props.tracksArrayData.find(obj => {
                return obj.id === props.trackData.id;
            })
            if(found) {
                setBpm(Math.round(found.tempo));
                setKey(pitchToCamelot(found.key, found.mode));
            }
        }
    },[])
    
    const renderArtistsNames = (artists) => {
        let names = '';
        for (let i=0; i<artists.length; i++) {
            names+=artists[i].name;
            if(i!==artists.length-1) {
                names+=', ';
            }
        }
        return names;
    }

    const pitchToCamelot = (key, mode) => {
        let input = String(key)+String(mode);
        const camelot = pitchToCamelotDictionary[input];
        return camelot;
    }

    return (
        <li key={props.trackData.id} className="song-item">
            <a className='link-to-song' href={"mash-them-up/similar?id="+props.trackData.id}>
                <div className="img-with-data">
                <img src={props.trackData.album.images[0].url} alt="" />
                    <div className="title-artist">
                        <p className='song-title'>{props.trackData.name}</p>
                        <p className='song-artist'>{renderArtistsNames(props.trackData.artists)}</p>
                    </div>
                </div>
                <div className="bpm-container">
                    <p className="tempo">{bpm ? bpm : ''}</p>
                    <p className='tempo-label'>BPM</p>
                </div>
                <div className="key-container">
                    <p className="key">{key ? key : ''}</p>
                    <p className='key-label'>key</p>
                </div>
            </a>
        </li>
    );
}

export default SongItem;