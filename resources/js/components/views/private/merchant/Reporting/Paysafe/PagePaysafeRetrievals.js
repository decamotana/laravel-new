import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Button,
    Table,
    Input,
    Divider,
    Popconfirm,
    notification,
    DatePicker
} from "antd";
import getUserData from "../../../../../providers/getUserData";
import useAxiosQuery from "../../../../../providers/useAxiosQuery";
import TableColumnSettings from "../../../../../providers/TableColumnSettings";
// import PagePaysafeDepositDetailModal from "./PagePaysafeDepositDetailModal";
import ContentHeader from "./PagePaysafeContentHeader";
import { number_format } from "../../../../../providers/number_format";
import { CSVLink } from "react-csv";

import {
    DeleteFilled,
    EditFilled,
    PlusCircleOutlined,
    UploadOutlined,
    SettingOutlined,
    FileExcelOutlined,
    ReloadOutlined,
    PrinterOutlined
} from "@ant-design/icons";

import { renderToString } from "react-dom/server";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CustomTableTitle from "../../../../../providers/CustomTableTitle";
import ResizableAntdTable from "resizable-antd-table";

const PagePaysafeRetrievals = ({ history, match }) => {
    const { RangePicker } = DatePicker;
    const [List, setList] = useState([]);
    const [dataTableInfo, setDataTableInfo] = useState({
        filter_value: "",
        page_number: 1,
        page_size: "20",
        column: localStorage.account_paysafe_retrievals_table_sort_column,
        order: localStorage.account_paysafe_retrievals_table_sort_order,
        drange: [
            moment()
                .subtract(1, "month")
                .format("YYYY-MM-DD"),
            moment().format("YYYY-MM-DD")
        ]
    });

    const userdata = getUserData();
    const [showTable, setShowTable] = useState(false);

    const {
        mutate: mutateRetrievals,
        isLoading: isLoadingRetrievals
    } = useAxiosQuery(
        "POST",
        "api/v1/paysafe/retrievals/filtered",
        "retrievals_merchant_list"
    );

    useEffect(() => {
        console.log("@dataTableInfo", dataTableInfo);
        localStorage.account_paysafe_retrievals_table_sort_column =
            dataTableInfo.column;
        localStorage.account_paysafe_retrievals_table_sort_order =
            dataTableInfo.order;
        getRetrievalsList();
        return () => {};
    }, [dataTableInfo]);

    const [csvData, setCsvData] = useState([]);
    let ExportFileName =
        "Reporting Paysafe Retrievals- " + moment().format("YYYY-MM-DD");

    const getRetrievalsList = () => {
        mutateRetrievals(
            { ...dataTableInfo, merchant_number: match.params.merchant_number },
            {
                onSuccess: res => {
                    console.log(res);
                    // setList(res);
                    // let array_get = [];
                    // res.data.data.map((value, key) => {
                    //     array_get.push({

                    //     });
                    // });

                    // setCsvData(array_get);
                },
                onError: err => {
                    console.log(err);
                }
            }
        );
    };

    const HeaderReport = () => (
        <div
            style={{
                position: "relative",
                padding: 20,
                width: "600px",
                textAlign: "center",
                bordered: "1px"
            }}
        >
            <h1
                style={{ fontSize: "15px", width: "100%", textAlign: "center" }}
            >
                PaySafe Retrievals
            </h1>
        </div>
    );

    const exportPDF = () => {
        const htmlToConvert = renderToString(<HeaderReport />);
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape "; // portrait or landscape

        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(15);

        const headers = [
            [
                "Merchant Number",
                "Amount",
                "Family Id",
                "Case Number",
                "Card Number",
                "Transaction Date",
                "Recieved Date",
                "Resolved Date",
                "Reason"
            ]
        ];
        const data = csvData.map(elt => []);

        let content = {
            startY: 80,
            head: headers
            // body: data
        };

        doc.html(htmlToConvert, {
            callback: function(doc) {
                doc.autoTable(content);
                doc.save(ExportFileName + ".pdf");
            }
        });
    };

    const [showTableColumnSettings, setShowTableColumnSettings] = useState({
        show: false,
        data: localStorage.column_settings_account_paysafe_retrievals_table
            ? JSON.parse(
                  localStorage.column_settings_account_paysafe_retrievals_table
              )
            : [
                  {
                      title: "Merchant Number",
                      show: true
                  },
                  {
                      title: "Amount",
                      show: true
                  },

                  { title: "Family Id", show: true },
                  { title: "Case Number", show: true },
                  { title: "Card Number", show: true },
                  { title: "Transaction Date", show: true },
                  { title: "Recieved Date", show: true },
                  { title: "Resolved Date", show: true },
                  { title: "Reason", show: true }
              ]
    });

    const checkIfDefault = column => {
        if (localStorage.account_paysafe_retrievals_table_sort_column) {
            if (
                localStorage.account_paysafe_retrievals_table_sort_column ==
                column
            ) {
                return (
                    localStorage.account_paysafe_retrievals_table_sort_order +
                    "end"
                );
            }
        }

        return null;
    };

    const OpenSettings = () => {
        setShowTableColumnSettings({
            ...showTableColumnSettings,
            show: true
        });
    };

    const [searchText, setSearchText] = useState("");
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDataTableInfo({
                ...dataTableInfo,
                filter_value: searchText,
                page_number: 1
            });
        }, 500);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchText]);

    const [selectedDepositNumber, setSelectedDepositNumber] = useState();
    const [selectedMerchantNumber, setSelectedMerchantNumber] = useState();
    const [showModalDepositDetails, setShowModalDepositDetails] = useState(
        false
    );

    const {
        mutate: mutateGetDepositList,
        isLoading: isLoadingGetDepositList
    } = useAxiosQuery(
        "POST",
        "api/v1/paysafe/retrievals/bulkinsert",
        "paysafe_get_merchant_list"
    );

    const handleGetRetrievalsList = e => {
        mutateGetDepositList(
            {},
            {
                onSuccess: res => {
                    notification.success({
                        message: "Retrievals Data Updated"
                    });
                    getRetrievalsList();
                },
                onError: err => {
                    console.log(err);
                }
            }
        );
    };

    useEffect(() => {
        let col_sizes = localStorage.retrieval_table_col_sizes
            ? JSON.parse(localStorage.retrieval_table_col_sizes)
            : null;
        // console.log("col_sizes", col_sizes);
        if (col_sizes) {
            Object.keys(col_sizes).map((title, key) => {
                // console.log($("table th:contains(" + title + ")"));
                // console.log(title, Object.values(col_sizes)[key]);
                $("table th:contains(" + title + ")").attr(
                    "width",
                    parseInt(Object.values(col_sizes)[key])
                );
            });
        }
        return () => {};
    }, []);

    useEffect(() => {
        if (!localStorage.retrieval_table_col_sizes) {
            var a = {
                "Merchant Number": 168,
                Amount: 105,
                "Family Id": 114,
                "Case Number": 135,
                "Card Number": 133,
                "Transaction Date": 151,
                "Recieved Date": 137,
                "Resolved Date": 142,
                Reason: 99
            };

            localStorage.setItem(
                "retrieval_table_col_sizes",
                JSON.stringify(a)
            );

            $(`table th:nth-child(1)`).prop("width", 168);
            $(`table th:nth-child(2)`).prop("width", 105);
            $(`table th:nth-child(3)`).prop("width", 114);
            $(`table th:nth-child(4)`).prop("width", 135);
            $(`table th:nth-child(5)`).prop("width", 133);
            $(`table th:nth-child(6)`).prop("width", 151);
            $(`table th:nth-child(7)`).prop("width", 137);
            $(`table th:nth-child(8)`).prop("width", 142);
            $(`table th:nth-child(9)`).prop("width", 99);
        }

        return () => {};
    }, []);

    return (
        <div
            className=""
            id="paysafeRetrievals"
            style={{
                padding: "24px 16px"
            }}
        >
            <ContentHeader
                history={history}
                merchantNumber={match.params.merchant_number}
            />

            <div style={{ position: "relative", width: "100%", top: "20px" }}>
                <Row>
                    <Col md={24}>
                        <Card
                            title="Retrievals List"
                            bordered={false}
                            extra={
                                <Button
                                    type="primary"
                                    title="Upload"
                                    icon={<ReloadOutlined />}
                                    loading={isLoadingGetDepositList}
                                    onClick={e => handleGetRetrievalsList()}
                                >
                                    Refresh Retrievals List
                                </Button>
                            }
                        >
                            <Row>
                                <Col md={8} xs={0}>
                                    {/* {console.log(moment().format("YYYY-MM-DD"))} */}
                                    <RangePicker
                                        format={"YYYY-MM-DD"}
                                        defaultValue={[
                                            moment().subtract(1, "month"),
                                            moment()
                                        ]}
                                        onChange={(value, dateString) => {
                                            setDataTableInfo({
                                                ...dataTableInfo,
                                                drange: dateString
                                            });
                                        }}
                                    />
                                </Col>
                                <Col md={8} sm={0}></Col>
                                <Col md={8} sm={24}>
                                    <div style={{ display: "flex" }}>
                                        {" "}
                                        <Input.Search
                                            placeholder="Global Search"
                                            onSearch={e =>
                                                setDataTableInfo({
                                                    ...dataTableInfo,
                                                    filter_value: e,
                                                    page_number: 1
                                                })
                                            }
                                            onChange={e =>
                                                setSearchText(e.target.value)
                                            }
                                        />
                                        <Button
                                            icon={<SettingOutlined />}
                                            style={{ marginLeft: "5px" }}
                                            onClick={() => OpenSettings()}
                                        ></Button>
                                    </div>
                                </Col>
                            </Row>
                            <Divider />

                            <div className="table-responsive">
                                <ResizableAntdTable
                                    scroll={{ x: "fit-content" }}
                                    loading={isLoadingRetrievals}
                                    rowKey={record => record.id}
                                    dataSource={
                                        List.length != 0 ? List.data.data : []
                                    }
                                    pagination={{
                                        pageSize: dataTableInfo.page_size,
                                        current:
                                            List.length != 0
                                                ? List.data.current_page
                                                : 1,
                                        showSizeChanger: true,
                                        total:
                                            List.length != 0
                                                ? List.data.total
                                                : 1,

                                        showTotal: (total, range) =>
                                            `${range[0]}-${range[1]} of ${total} items`,

                                        pageSizeOptions: [20, 50, 100, 200]
                                    }}
                                    onChange={(
                                        pagination,
                                        filters,
                                        sorter,
                                        extra
                                    ) => {
                                        setDataTableInfo({
                                            ...dataTableInfo,
                                            page_number: pagination.current,
                                            page_size: pagination.pageSize
                                            // column: sorter.columnKey,
                                            // order: sorter.order
                                            //     ? sorter.order.replace(
                                            //           "end",
                                            //           ""
                                            //       )
                                            //     : null
                                        });

                                        // localStorage.account_paysafe_chargeBacks_table_sort_column =
                                        //     sorter.columnKey;
                                        // localStorage.account_paysafe_chargeBacks_table_sort_order = sorter.order
                                        //     ? sorter.order.replace("end", "")
                                        //     : null;

                                        // let array_get = [];
                                        // extra.currentDataSource.map((value, key) => {
                                        //     array_get.push({

                                        //     });
                                        // });
                                        // setCsvData(array_get);
                                    }}
                                >
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Merchant Number"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="merchant_number"
                                            key="merchant_number"
                                            title={
                                                <CustomTableTitle
                                                    title="Merchant Number"
                                                    dataIndex="merchant_number"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Amount"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="amount"
                                            key="amount"
                                            title={
                                                <CustomTableTitle
                                                    title="Amount"
                                                    dataIndex="amount"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Family Id"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="family_id"
                                            key="family_id"
                                            title={
                                                <CustomTableTitle
                                                    title="Family Id"
                                                    dataIndex="family_id"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Case Number"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="case_number"
                                            key="case_number"
                                            title={
                                                <CustomTableTitle
                                                    title="Case Number"
                                                    dataIndex="case_number"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Card Number"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="cardnumber"
                                            key="cardnumber"
                                            title={
                                                <CustomTableTitle
                                                    title="Card Number"
                                                    dataIndex="cardnumber"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Transaction Date"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="transaction_date"
                                            key="transaction_date"
                                            title={
                                                <CustomTableTitle
                                                    title="Transaction Date"
                                                    dataIndex="transaction_date"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}

                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Recieved Date"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="recieved_date"
                                            key="recieved_date"
                                            title={
                                                <CustomTableTitle
                                                    title="Recieved Date"
                                                    dataIndex="recieved_date"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Resolved Date"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="resolved_date"
                                            key="resolved_date"
                                            title={
                                                <CustomTableTitle
                                                    title="Resolved Date"
                                                    dataIndex="resolved_date"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {showTableColumnSettings.data.find(
                                        p => p.title == "Reason"
                                    ).show && (
                                        <Table.Column
                                            ellipsis={true}
                                            dataIndex="resreasonolved_date"
                                            key="reason"
                                            title={
                                                <CustomTableTitle
                                                    title="Reason"
                                                    dataIndex="reason"
                                                    dataTableInfo={
                                                        dataTableInfo
                                                    }
                                                    setDataTableInfo={
                                                        setDataTableInfo
                                                    }
                                                    localStorageKey="retrieval_table_col_sizes"
                                                    localStorageTableCols={
                                                        localStorage.column_settings_account_paysafe_retrievals_table
                                                            ? JSON.parse(
                                                                  localStorage.column_settings_account_paysafe_retrievals_table
                                                              ).length
                                                            : 0
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                </ResizableAntdTable>
                            </div>
                        </Card>{" "}
                        <TableColumnSettings
                            showTableColumnSettings={showTableColumnSettings}
                            setShowTableColumnSettings={
                                setShowTableColumnSettings
                            }
                            localStorageKey="column_settings_account_paysafe_retrievals_table"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PagePaysafeRetrievals;
