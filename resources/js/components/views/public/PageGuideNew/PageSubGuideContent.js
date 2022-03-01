import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Input,
    Button,
    Modal,
    Form,
    Typography,
    Popconfirm,
    notification,
    Divider,
    Breadcrumb,
    Table
} from "antd";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
    DeleteFilled,
    EditFilled,
    PlusCircleOutlined,
    UploadOutlined,
    SettingOutlined,
    FileExcelOutlined,
    DownOutlined,
    RightOutlined,
    EyeOutlined,
    LoadingOutlined,
    EditOutlined,
    FileTextOutlined
} from "@ant-design/icons";

import { Link, useLocation, useHistory } from "react-router-dom";
import copyToClipboard from "../../../providers/copyToClipboard";
import useAxiosQuery from "../../../providers/useAxiosQuery";
import { duration } from "moment";
import getUserData from "../../../providers/getUserData";
import PageGuideHeader from "./PageGuideHeader";
import PageGuideSideBar from "./PageGuideSideBar";

const PageSubGuideContent = ({ history, match }) => {
    const { Title } = Typography;
    const [cardGuidesContent, setCardGuidesContent] = useState([]);
    const [cardGuidesTitle, setCardGuidesTitle] = useState("");
    const [cardGuidesParent, setCardGuidesParent] = useState("");
    const {
        data: guideContent,
        refetch: refetchGuideContent,
        isLoading: isLoadingGuideContent
    } = useAxiosQuery(
        "GET",
        `api/v1/guide_sub_new_content/${match.params.id}`,
        `guide_sub_new_conent_${match.params.id}`,
        res => {
            console.log(res);

            setCardGuidesContent(res.data);
            setCardGuidesTitle(res.title.sub_title);
            setCardGuidesParent(res.parent[0]);
        }
    );

    const [showAddeEditContentModal, setShowAddEditContentModal] = useState(
        false
    );
    const [addOnly, setAddOnly] = useState(true);

    const showModalAddGuideContent = () => {
        setShowAddEditContentModal(!showAddeEditContentModal);
        setAddOnly(true);
    };

    const [updateData, setUpdateData] = useState({});
    const showModalEditGuide = data => {
        setAddOnly(false);
        setUpdateData(data);
        setShowAddEditContentModal(!showAddeEditContentModal);
    };

    const {
        mutate: mutateDeleteContent,
        isLoading: isLoadingDeleteContent
    } = useAxiosQuery(
        "POST",
        "api/v1/guide_contents/delete",
        `guide_sub_new_conent_${match.params.id}`
    );

    const deleteContent = (id, guide_id, type) => {
        mutateDeleteContent(
            {
                id: id,
                guide_id: guide_id,
                type: type
            },
            {
                onSuccess: res => {
                    notification.success({
                        message: "Content Deleted Successfully "
                    });
                },
                onError: err => {
                    console.log(err);
                }
            }
        );
    };

    const [cardSubGuides, setSubGuides] = useState([]);

    const {
        data: guideSub,
        refetch: refetchGuideSub,
        isLoading: isLoadinGuideSub
    } = useAxiosQuery(
        "GET",
        `api/v1/guide_sub_sub/${match.params.id}`,
        `guide_sub_sub_${match.params.id}`,
        res => {
            console.log("@data", res);
            setSubGuides(res.data);
        }
    );

    const [showAddeSub, setShowAddAddeSub] = useState(false);
    const [addOnlySub, setAddOnlySub] = useState(true);

    const showModalAddSub = () => {
        setShowAddAddeSub(!showAddeSub);
        setAddOnlySub(true);
    };

    const [updateDataSub, setUpdateDataSub] = useState({});

    const showModalEditSub = data => {
        setAddOnlySub(false);
        setUpdateDataSub(data);
        setShowAddAddeSub(!showAddeEditContentModal);
    };

    const {
        mutate: mutateDeleteGuideSub,
        isLoading: isLoadingDeleteGuideSub
    } = useAxiosQuery(
        "POST",
        "api/v1/guide_sub/delete",
        `guide_sub_sub${match.params.id}`
    );

    const deleteGuideSub = id => {
        mutateDeleteGuideSub(
            {
                id: id
            },
            {
                onSuccess: res => {
                    notification.success({
                        message: "Sub Guide Title Deleted Successfully"
                    });
                },
                onError: err => {
                    console.log(err);
                }
            }
        );
    };

    const columns = [
        {
            title: "File Name",
            dataIndex: "file_name",
            key: "file_name"
        },
        {
            title: "File Url",
            dataIndex: "file_url",
            key: "file_url",
            render: file_url => (
                <a
                    href="#"
                    onClick={e => {
                        copyToClipboard(
                            window.location.origin + "/" + file_url
                        );
                        let _message =
                            "File Url Successfully Copied to Clipboard";
                        message.success({
                            content: _message,
                            duration: 2
                        });
                    }}
                >
                    Copy
                </a>
            )
        }
    ];

    return (
        <div
            className="app"
            style={{
                paddingLeft: "7%",
                paddingRight: "7%",
                background: "white"
            }}
        >
            <div>
                <PageGuideHeader history={history} />
            </div>
            <div
                style={{
                    background: "white",
                    padding: "40px",
                    paddingTop: "5px"
                }}
                className="pageguidecardcontent"
            >
                <Row style={{ paddingTop: "10px" }} gutter={24}>
                    <Col md={7}>
                        <div className="sidebarStickyPublic">
                            {cardGuidesParent && (
                                <PageGuideSideBar
                                    history={history}
                                    match={match}
                                    match_id={
                                        cardGuidesParent.merchant_guide.id
                                    }
                                    title={cardGuidesTitle}
                                    refetchsub={refetchGuideSub}
                                />
                            )}
                        </div>
                    </Col>
                    <Col md={17}>
                        <>
                            {" "}
                            <Row>
                                <Col md={24}>
                                    <Breadcrumb>
                                        <Breadcrumb.Item>
                                            <Link to={"/guides"}> Home </Link>
                                        </Breadcrumb.Item>
                                        {cardGuidesParent && (
                                            <Breadcrumb.Item>
                                                <Link
                                                    to={
                                                        "/guides/" +
                                                        cardGuidesParent
                                                            .merchant_guide.id
                                                    }
                                                >
                                                    {
                                                        cardGuidesParent
                                                            .merchant_guide
                                                            .title
                                                    }{" "}
                                                </Link>
                                            </Breadcrumb.Item>
                                        )}

                                        <Breadcrumb.Item>
                                            {cardGuidesTitle}
                                        </Breadcrumb.Item>
                                    </Breadcrumb>
                                </Col>
                            </Row>
                            <Row style={{ paddingTop: "10px" }}>
                                <Col md={24}>
                                    <Title>{cardGuidesTitle} </Title>
                                </Col>
                            </Row>
                            <Row>
                                {cardGuidesContent.length != 0 &&
                                    cardGuidesContent.map(
                                        (cardContent, key) => {
                                            return (
                                                <Col md={24} key={key}>
                                                    <Card
                                                        style={{
                                                            marginBottom: 10,

                                                            minHeight: "138px"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: cardContent.title
                                                                    ? "block"
                                                                    : "none"
                                                            }}
                                                        >
                                                            <Title level={4}>
                                                                <span
                                                                    style={{
                                                                        fontSize:
                                                                            "10px",
                                                                        position:
                                                                            "relative",
                                                                        top:
                                                                            "-2px"
                                                                    }}
                                                                >
                                                                    <i className="fa fa-circle"></i>
                                                                </span>{" "}
                                                                {
                                                                    cardContent.title
                                                                }
                                                            </Title>
                                                        </div>
                                                        <div
                                                            style={{
                                                                paddingLeft:
                                                                    "16px"
                                                            }}
                                                        >
                                                            <div
                                                                className="dynamic-content-div"
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        cardContent.content
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                // marginBottom: 10,
                                                                // cursor: "pointer",
                                                                // minHeight: "138px",
                                                                border: "none",
                                                                paddingLeft:
                                                                    "24px",
                                                                paddingRight:
                                                                    "24px",
                                                                marginTop:
                                                                    "10px"
                                                            }}
                                                        >
                                                            <div>
                                                                <Table
                                                                    dataSource={
                                                                        cardContent
                                                                            ? cardContent.merchant_guide_files
                                                                            : []
                                                                    }
                                                                    columns={
                                                                        columns
                                                                    }
                                                                    pagination={
                                                                        false
                                                                    }
                                                                    rowKey={record =>
                                                                        record.id
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </Col>
                                            );
                                        }
                                    )}
                            </Row>
                            <Divider />
                            <Row>
                                {cardSubGuides.length != 0 &&
                                    cardSubGuides.map((subGuide, key) => {
                                        return (
                                            <Col
                                                key={key}
                                                md={24}
                                                style={{ marginBottom: "10px" }}
                                            >
                                                {console.log(match)}
                                                <Link
                                                    to={`${match.url}/sub-sub/${subGuide.id}`}
                                                    style={{
                                                        fontSize: "20px",
                                                        color: "#FE6933",
                                                        marginLeft: "30px"
                                                    }}
                                                >
                                                    {" "}
                                                    <FileTextOutlined
                                                        style={{
                                                            marginRight: "10px"
                                                        }}
                                                    />
                                                    {subGuide.sub_sub_title}
                                                </Link>
                                            </Col>
                                        );
                                    })}
                            </Row>
                        </>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PageSubGuideContent;
