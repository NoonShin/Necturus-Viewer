import {Fragment, useEffect, useState} from "react";
import * as AppUtil from "../util/app-util";
import Container from "react-bootstrap/Container";
import AnnotationContainer from "./AnnotationContainer";
import {Responsive, WidthProvider} from "react-grid-layout";
import Cookies from "universal-cookie";
import {CustomNavbar} from "./CustomNavbar";
import {TranskribusImportModal} from "./TranskribusImportModal";
import {DynamicXMLViewer} from "./DynamicXMLViewer";
import {CustomPagination} from "./CustomPagination";
import {DBImportModal} from "./DBImportModal";
import {Breadcrumb, Button, Col} from "react-bootstrap";
import SearchModal from "./SearchModal";
import {Link} from "react-router-dom";
const cookies = new Cookies();


const ResponsiveGridLayout = WidthProvider(Responsive);

export function XMLViewerContainer() {
    const [selectedZone, setSelectedZone] = useState("");
    const [layout, setLayout] = useState(AppUtil.sideBySideLayout);

    const [filesInfo, setFilesInfo] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [annoZones, setAnnoZones] = useState()

    const [trLoadShow, setTrLoadShow] = useState(false);
    const [dbLoadShow, setDbLoadShow] = useState(false);
    const [searchShow, setSearchShow] = useState(false);

    const [dbUrl, setDbUrl] = useState();
    const [dbCollection, setDbCollection] = useState();
    const [currentPageName, setCurrentPageName] = useState("");

    const [searchedItemLocation, SetSearchedItemLocation] = useState();

    function resetLayout(newLayout) {
        if (newLayout === 'sbs') {
            setLayout(AppUtil.sideBySideLayout)
        }
        else if (newLayout === 'fw') {
            setLayout(AppUtil.fullWidthLayout)
        }
    }

    function onLayoutChange(layout, layouts) {
        setLayout(layouts)
    }

    function handleLogout() {
        cookies.remove("TOKEN", { path: "/" });
        window.location.href = '#/login'
    }

    function transkribusModal() {
        setTrLoadShow(!(trLoadShow));
    }

    function dbModal() {
        setDbLoadShow(!(dbLoadShow));
    }

    function searchModal() {
        setSearchShow(!(searchShow));
    }

    useEffect(() => {
        const loadFilesInfo = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/files_info.json`);
                const data = await response.json();
                setFilesInfo(data);
            }
            catch (e) {
                console.error(e)
            }
        };
        loadFilesInfo();
    }, []);

    useEffect(() => {
        if (currentPage && dbUrl) {
            setCurrentPageName(dbCollection.files[currentPage - 1].name.slice(0, -4));
        }
    }, [currentPage])

    useEffect(() => {
        if (dbCollection) {
            // natural sort (so that e.g. 1r.xml comes before 10r.xml)
            dbCollection.files.sort((a, b) => {
                return a.name.localeCompare(b.name, undefined, {numeric: true})
            })
            setCurrentPageName(dbCollection.files[0].name.slice(0, -4));
            setFilesInfo(dbCollection.files.map(item => item.url))
            setCurrentPage(1);
        }
    }, [dbCollection])

    useEffect(() => {
        if (searchedItemLocation) {
            const key = Object.keys(filesInfo).find(key => filesInfo[key] === searchedItemLocation['url']);
            setCurrentPage(parseInt(key) + 1);

            //TODO: This is not ideal, I should find a better way to do this
            setTimeout(() => {
                setSelectedZone(searchedItemLocation['facs'].slice(1));
            }, 100);        }
    }, [searchedItemLocation]);

    return (
        <Fragment>
            <CustomNavbar loggedIn={true} helperFunctions={{transkribusModal, resetLayout, handleLogout, dbModal}} />
            <Container>
                <TranskribusImportModal show={trLoadShow} switchShow={transkribusModal} />
                <DBImportModal show={dbLoadShow} switchShow={dbModal} setCollection={setDbCollection} setDbUrl={setDbUrl} />
                <SearchModal show={searchShow} switchShow={searchModal} dbUrl={dbUrl} collectionId={dbCollection?.name} setSearchedItemLocation={SetSearchedItemLocation} />
                {dbCollection &&
                <Fragment>
                    <div className="d-flex align-items-center my-breadcrumb-container border bg-light h-100 p-2">
                        <Col className={"col-10"}>
                        <Breadcrumb className="pt-3 px-2">
                            <Breadcrumb.Item active href="#">XML Database</Breadcrumb.Item>
                            <Breadcrumb.Item active onClick={dbModal} style={{cursor: 'pointer'}}>{dbCollection?.name}</Breadcrumb.Item>
                            <Breadcrumb.Item active>{currentPageName}</Breadcrumb.Item>
                        </Breadcrumb>
                        </Col>
                        <Col className={"col-2 search-column"}>
                            <Button variant="link" onClick={searchModal} style={{ textDecoration: 'none', color: '#212529BF' }}>
                                Search Collection
                            </Button>
                        </Col>
                    </div>
                </Fragment>
                }
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layout}
                    breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={130}
                    draggableHandle=".drag-handle"
                    onLayoutChange={(layout, layouts) =>
                        onLayoutChange(layout, layouts)
                    }
                >
                    <div key="1">
                        <div className="border bg-light h-100 p-3">
                            <DynamicXMLViewer onSelection={selectedZone} setSelection={setSelectedZone}
                                              currentPage={filesInfo ? filesInfo[currentPage - 1] : ''}
                                              setAnnoZones={setAnnoZones} dbUrl={dbUrl}/>
                        </div>
                    </div>
                    <div key="2">
                        <div className="border bg-light h-100 p-3">
                            <AnnotationContainer onSelection={selectedZone} setSelection={setSelectedZone}
                                                 currentPage={filesInfo ? filesInfo[currentPage - 1] : ''}
                                                 annoZones={annoZones} dbUrl={dbUrl}/>
                        </div>
                    </div>

                </ResponsiveGridLayout>
                <CustomPagination currentPage={currentPage} setCurrentPage={setCurrentPage}
                                  totalPages={filesInfo ? filesInfo.length : 0}/>
            </Container>

        </Fragment>
    )
}