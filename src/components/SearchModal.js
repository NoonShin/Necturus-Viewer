import React, {useEffect, useRef, useState} from 'react';
import {Modal, Button, Form, ListGroup, Col, Row} from 'react-bootstrap';
import axios from "axios";

function SearchModal({ show, switchShow, dbUrl, collectionId, setSearchedItemLocation }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState();

    const inputRef = useRef(null);

    const normalizeResults = (result) => {
        if (result && result['hit-count'] > 0) {
            // If results['hits'] is not an array, make it an array
            return Array.isArray(result['hits']) ? result['hits'] : [result['hits']];
        }
        return [];
    };

    const handleSearch = () => {
        const reqUrl = dbUrl.concat("/search.xql")
        // const params = new URLSearchParams({ collection: collectionId, term: '\"' + searchTerm + '\"' });
        const params = new URLSearchParams({ collection: collectionId, term: searchTerm });
        axios.get(reqUrl, {params})
            .then((result) => {
                setResults(normalizeResults(result.data));
            })
            .catch((error) => {
                console.log(error)
            });
    };

    const handleItemClick = (item) => {
        setSearchedItemLocation({
            'facs': item['facs-attribute'],
            'url': item['url']
        })
        switchShow();
    }

    useEffect(() => {
        if (collectionId) {
            setResults(undefined);
            setSearchTerm('');
        }
    }, [collectionId])

    useEffect(() => {
        if (show && inputRef.current) {
            inputRef.current.focus();  // Focus the input field when the modal is shown
        }
    }, [show]);

    return (
        <Modal show={show} onHide={switchShow}>
            <Modal.Header closeButton>
                <Modal.Title>Search Collection</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="align-items-center">
                        <Col sm={9}>
                            <Form.Control
                                ref={inputRef}
                                className="search-result-item"
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col sm={3}>
                            <Button variant="primary" onClick={handleSearch} style={{ width: '100%' }}>
                                Search
                            </Button>
                        </Col>
                    </Form.Group>
                </Form>
                <ListGroup className="mt-3" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                    {results ? (results.length > 0 ? results.map((item, index) => (
                        <ListGroup.Item key={index} className="clickable-item" onClick={() => handleItemClick(item)}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item['document'].slice(0, -4)}</div>
                            <div className="search-result-item" dangerouslySetInnerHTML={{__html: item['hit']}} />
                        </ListGroup.Item>
                    )) : <div className="text-center mt-3 mb-3">No results found</div>) : ''}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
}

export default SearchModal;
