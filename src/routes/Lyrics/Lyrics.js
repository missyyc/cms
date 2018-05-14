import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    Icon,
    Button,
    Dropdown,
    Menu,
    InputNumber,
    DatePicker,
    Modal,
    message,
    Badge,
    Divider,
    Radio,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Lyrics.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const getValue = obj =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');

const CreateForm = Form.create()(props => {
    const {
        modalVisible,
        editableItem,
        editable,
        form,
        handleCreate,
        handleUpdate,
        handleModalVisible,
    } = props;
    const { getFieldDecorator } = form;
    const okHandle = () => {
        form.validateFields((err, fieldsValue) => {
            let newFieldsValue = { ...fieldsValue };
            if (err) return;
            form.resetFields();
            if (editable) {
                newFieldsValue = { ...newFieldsValue, _id: editableItem._id };
                handleUpdate(newFieldsValue);
            } else {
                handleCreate(newFieldsValue);
            }
        });
    };
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 7 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 12 },
            md: { span: 10 },
        },
    };

    const tagsOptions = [];
    for (let i = 10; i < 36; i++) {
        tagsOptions.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }

    return (
        <Modal
            title="添加歌曲"
            visible={modalVisible}
            onOk={okHandle}
            onCancel={() => handleModalVisible()}
            width={1000}
        >
            <Card bordered={false}>
                <Form hideRequiredMark style={{ marginTop: 8 }}>
                    <FormItem {...formItemLayout} label="歌曲名称">
                        {getFieldDecorator('song_name', {
                            initialValue: editableItem.song_name,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入歌曲名称',
                                },
                            ],
                        })(<Input placeholder="歌曲名称" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="歌者">
                        {getFieldDecorator('singer', {
                            initialValue: editableItem.singer,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入歌者',
                                },
                            ],
                        })(<Input placeholder="歌者" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="歌词">
                        {getFieldDecorator('lyrics', {
                            initialValue: editableItem.lyrics,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入歌词',
                                },
                            ],
                        })(<TextArea placeholder="歌词" autosize={{ minRows: 10 }} />)}
                    </FormItem>
                </Form>
            </Card>
        </Modal>
    );
});

@connect(({ lyrics, loading }) => ({
    lyrics,
    loading: loading.models.lyrics,
}))
@Form.create()
export default class SongsList extends PureComponent {
    state = {
        modalVisible: false,
        expandForm: false,
        selectedRows: [],
        formValues: {},
        editable: false,
        editableItem: {},
    };

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'lyrics/list',
        });
    }

    handleStandardTableChange = (pagination, filtersArg, sorter) => {
        const { dispatch } = this.props;
        const { formValues } = this.state;

        const filters = Object.keys(filtersArg).reduce((obj, key) => {
            const newObj = { ...obj };
            newObj[key] = getValue(filtersArg[key]);
            return newObj;
        }, {});

        const params = {
            currentPage: pagination.current,
            pageSize: pagination.pageSize,
            ...formValues,
            ...filters,
        };
        if (sorter.field) {
            params.sorter = `${sorter.field}_${sorter.order}`;
        }

        dispatch({
            type: 'lyrics/list',
            payload: params,
        });
    };

    handleFormReset = () => {
        const { form, dispatch } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        dispatch({
            type: 'lyrics/list',
            payload: {},
        });
    };

    toggleForm = () => {
        this.setState({
            expandForm: !this.state.expandForm,
        });
    };

    handleMenuClick = e => {
        const { dispatch } = this.props;
        const { selectedRows } = this.state;
        if (!selectedRows) return;

        switch (e.key) {
            case 'remove':
                dispatch({
                    type: 'lyrics/deleteMulti',
                    payload: {
                        ids: selectedRows.map(row => row._id),
                    },
                    callback: () => {
                        this.setState({
                            selectedRows: [],
                        });
                    },
                });
                break;
            case 'upshelves':
                dispatch({
                    type: 'lyrics/updateMulti',
                    payload: {
                        ids: selectedRows.map(row => row._id),
                        attrs: {
                            status: 1,
                        },
                    },
                }).then(() => {
                    this.setState({
                        selectedRows: [],
                    });
                });
                break;
            default:
                dispatch({
                    type: 'lyrics/updateMulti',
                    payload: {
                        ids: selectedRows.map(row => row._id),
                        attrs: {
                            status: -1,
                        },
                    },
                }).then(() => {});
                break;
        }
    };

    handleSelectRows = rows => {
        this.setState({
            selectedRows: rows,
        });
    };

    handleSearch = e => {
        e.preventDefault();

        const { dispatch, form } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = {
                ...fieldsValue,
                updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
            };

            this.setState({
                formValues: values,
            });

            dispatch({
                type: 'lyrics/list',
                payload: values,
            });
        });
    };

    handleModalVisible = flag => {
        this.setState({
            modalVisible: !!flag,
        });
    };

    handleCreate = fields => {
        this.props
            .dispatch({
                type: 'lyrics/create',
                payload: fields,
            })
            .then(() => {
                this.setState({
                    modalVisible: false,
                });
            });
    };

    handleUpdate = fields => {
        this.props
            .dispatch({
                type: 'lyrics/update',
                payload: fields,
            })
            .then(() => {
                this.setState({
                    modalVisible: false,
                });
            });
    };

    createItem = () => {
        this.setState({
            editable: false,
            editableItem: {},
            modalVisible: true,
        });
    };

    editItem = item => {
        this.setState({
            editable: true,
            editableItem: item,
            modalVisible: true,
        });
    };

    updateItem = item => {
        this.props.dispatch({
            type: 'lyrics/update',
            payload: item,
        });
    };

    render() {
        const { lyrics: { list }, loading } = this.props;
        const { selectedRows, editable, editableItem, modalVisible } = this.state;

        const columns = [
            {
                title: '歌曲名',
                dataIndex: 'song_name',
            },
            {
                title: '歌者',
                dataIndex: 'singer',
            },
            {
                title: '歌词',
                dataIndex: 'lyrics',
                render: val => `${val.substring(0, 20)}...`,
            },
            {
                title: '操作',
                render: (text, row, index) => (
                    <Fragment>
                        <a href-void="true" onClick={() => this.editItem(row)}>
                            更新
                        </a>
                    </Fragment>
                ),
            },
        ];

        const menu = (
            <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
                <Menu.Item key="remove">删除</Menu.Item>
            </Menu>
        );

        const parentMethods = {
            handleCreate: this.handleCreate,
            handleUpdate: this.handleUpdate,
            handleModalVisible: this.handleModalVisible,
        };

        return (
            <PageHeaderLayout title="查询表格">
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListOperator}>
                            <Button icon="plus" type="primary" onClick={() => this.createItem()}>
                                新建
                            </Button>
                            {selectedRows.length > 0 && (
                                <span>
                                    <Dropdown overlay={menu}>
                                        <Button>
                                            更多操作 <Icon type="down" />
                                        </Button>
                                    </Dropdown>
                                </span>
                            )}
                        </div>
                        <StandardTable
                            selectedRows={selectedRows}
                            loading={loading}
                            rowKey={row => row._id}
                            data={{ list }}
                            columns={columns}
                            onSelectRow={this.handleSelectRows}
                            onChange={this.handleStandardTableChange}
                        />
                    </div>
                </Card>
                <CreateForm
                    {...parentMethods}
                    modalVisible={modalVisible}
                    editable={editable}
                    editableItem={editableItem}
                />
            </PageHeaderLayout>
        );
    }
}
