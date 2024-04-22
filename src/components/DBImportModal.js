import Modal from "react-bootstrap/Modal";
import {Button, Form, ListGroup} from "react-bootstrap";
import {Fragment, useEffect, useRef, useState} from "react";
import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();


export function DBImportModal({ show, switchShow, setCollection, setDbUrl }) {
    const [url, setUrl] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);
    const [successfullyLoggedIn, setSuccessfullyLoggedIn] = useState(false);

    const [showCollections, setShowCollections] = useState(false);
    const [collections, setCollections] = useState([]);

    const hiddenLoginSubmit = useRef();

    const handleDbAccess = (e) => {
        setSuccessfullyLoggedIn(true);
        fetchCollections();
        // prevent the form from refreshing the whole page
        e.preventDefault();
    }

    const fetchCollections = () => {
        const cleanUrl = url.slice(-1) === '/' ? url.slice(0, -1) : url;
        const reqUrl = cleanUrl.concat('/getcollections/')
        axios.get('https://cdn.explorecams.com/storage/photos/LEFEikw0MR_1600.jpg')
            .then((result) => {
                console.log(result)
            })
        axios.get(reqUrl)
            .then((result) => {
                setDbUrl(cleanUrl)
                setCollections(result.data.collections)
            })
            .catch((error) => {
                console.log(error)
            });

        // const fetchedCollections = [
        //     {'name': 'Collection 1', 'url': 'xxx'},
        //     {'name': 'Collection 2', 'url': 'xxx'},
        //     {'name': 'Collection 3', 'url': 'xxx'}];
        // setCollections(fetchedCollections);
        switchShow();
        setShowCollections(true);
    };

    const handleLoginPress = (e) => {
        hiddenLoginSubmit.current.click();
    }

    const handleCollectionClose = () => setShowCollections(false);

    useEffect(() => {
        if (collections.length > 0 && show) {
            switchShow();
            setShowCollections(true);
        }
    }, [show]);

    return(
        <Fragment>
            <Modal show={show} onHide={switchShow}>
                <Modal.Header closeButton>
                    <Modal.Title>Import from XML Database</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e)=>handleDbAccess(e)} className="w-50 m1-auto mt-1">
                        {/* db URL */}
                        <Form.Group controlId="formBasicURL">
                            <Form.Label>Database Base URL</Form.Label>
                            <Form.Control
                                type="url"
                                name="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter base URL"
                            />
                        </Form.Group>

                        {/* username */}
                        <Form.Group controlId="formBasicEmail" className={"mt-2"}>
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                            />
                        </Form.Group>

                        {/* password */}
                        <Form.Group controlId="formBasicPassword" className={"mt-2 mb-2"}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </Form.Group>

                        {/* submit button */}
                        <Button
                            ref={hiddenLoginSubmit}
                            type="submit"
                            onClick={(e) => handleDbAccess(e)}
                            style={{display: 'none'}}
                        >
                            Login
                        </Button>
                        {loginFailed && <p className="text-danger">Username or password incorrect.</p>}

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={switchShow}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleLoginPress}>
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
            <CollectionModal
                collections={collections}
                show={showCollections}
                handleClose={handleCollectionClose}
                setCollection={setCollection}
            />
        </Fragment>
    )
}

const CollectionModal = ({ collections, show, handleClose, setCollection }) => {
    const handleCollectionSelect = (collection) => {
        const reqUrl = 'http://194.31.150.49/dbnyj/necturus.xql/' + collection.url
        axios.get(reqUrl)
            .then((result) => {
                setCollection(result.data)
            })
            .catch((error) => {
                console.log(error)
            });
        // const sampleCollection = {
        //     'name': 'Collection 1',
        //     'files': [
        //         'File 1',
        //         'File 2',
        //         'File 3'
        //     ]
        // }
        // setCollection(sampleCollection);
        handleClose();
    }
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Available Collections</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {collections.map((collection, idx) => (
                        <ListGroup.Item key={idx} action onClick={() => handleCollectionSelect(collection)}>
                            {collection.name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};