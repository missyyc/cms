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

import styles from './Tags.less';

const FormItem = Form.Item;
const { Option } = Select;

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
                    <FormItem {...formItemLayout} label="标签">
                        {getFieldDecorator('tag_name', {
                            initialValue: editableItem.tag_name,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入标签',
                                },
                            ],
                        })(<Input placeholder="标签" />)}
                    </FormItem>
                </Form>
            </Card>
        </Modal>
    );
});

@connect(({ tags, loading }) => ({
    tags,
    loading: loading.models.tags,
}))
@Form.create()
export default class TagsList extends PureComponent {
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
            type: 'tags/list',
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
            type: 'tags/list',
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
            type: 'tags/list',
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
                    type: 'tags/deleteMulti',
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
                    type: 'tags/updateMulti',
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
                    type: 'tags/updateMulti',
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
                type: 'tags/list',
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
                type: 'tags/create',
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
                type: 'tags/update',
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
            type: 'tags/update',
            payload: item,
        });
    };

    render() {
        const { tags: { list }, loading } = this.props;
        const { selectedRows, editable, editableItem, modalVisible } = this.state;

        const columns = [
            {
                title: '标签名',
                dataIndex: 'tag_name',
            },
            {
                title: '状态',
                dataIndex: 'status',
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
