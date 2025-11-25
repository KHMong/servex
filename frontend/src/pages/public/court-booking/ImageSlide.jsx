import React from 'react';
import { Carousel } from 'react-bootstrap';
import { getImageUrl } from '../../../utils/imageUrl';

const ImageSlide = ({ photos }) => {
    if (!photos || photos.length === 0) {
        return <div className="bg-light" style={{ height: '400px' }} />;
    }

    return (
        <Carousel>
            {photos.map(photo => {
                const imageUrl = getImageUrl(photo.photo);

                return (
                    <Carousel.Item key={photo.id}>
                        <img
                            className="d-block w-100 rounded"
                            src={imageUrl}
                            alt="Venue"
                            style={{ height: '450px', objectFit: 'contain' }}
                        />
                    </Carousel.Item>
                );
            })}
        </Carousel>
    );
};

export default ImageSlide;