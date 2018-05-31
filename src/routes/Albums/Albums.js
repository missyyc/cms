import React, { PureComponent, Fragment, Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
    Card,
    Form,
    Input,
    Select,
    Icon,
    Button,
    Dropdown,
    Menu,
    Modal,
    message,
    Divider,
    List,
    Upload,
    Tag,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Config from '../../config';

import styles from './Albums.less';

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
        tags,
        audios,
        qiniu: { token, domain },
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
                const { img } = newFieldsValue

                newFieldsValue = { ...newFieldsValue, _id: editableItem._id };

                if (img && img.response) {
                    const imgObj = {
                        type: img.type,
                        name: img.name,
                        url: `${domain}/${img.response.hash}`,
                        hash: img.response.hash,
                        key: img.response.key,
                        uid: img.uid,
                    };
    
                    newFieldsValue = { ...newFieldsValue, img: imgObj };
                }
                handleUpdate(newFieldsValue);
            } else {
                const { img } = newFieldsValue;

                const imgObj = {
                    type: img.type,
                    name: img.name,
                    url: `${domain}/${img.response.hash}`,
                    hash: img.response.hash,
                    key: img.response.key,
                    uid: img.uid,
                };

                newFieldsValue = Object.assign(newFieldsValue, { img: imgObj });

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

    const tagsOptions = tags.map((tag, idx) => {
        return (
            <Option key={`tag_option_${idx}`} value={tag._id}>
                {tag.tag_name}
            </Option>
        );
    });

    const audiosOptions = audios.map((audio, idx) => {
        return (
            <Option key={`audio_option_${idx}`} value={audio._id}>
                {audio.audio_name}
            </Option>
        );
    });

    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.file;
    };

    const uploadImgProps = {
        action: Config['qiniu-upload-url'],
        name: 'file',
        listType: 'picture-card',
        onChange({ file, fileList }) {
            if (file.status === 'uploading') {
                return;
            }
            if (file.status === 'done') {
                message.success(`${file.name} 上传成功`);
            }
            if (file.status === 'error') {
                message.error(`${file.name} 上传失败.`);
            }
        },
    };

    return (
        <Modal
            title="添加专辑"
            visible={modalVisible}
            onOk={okHandle}
            onCancel={() => handleModalVisible()}
            width={1000}
        >
            <Card bordered={false}>
                <Form hideRequiredMark style={{ marginTop: 8 }}>
                    <FormItem {...formItemLayout} label="专辑名称">
                        {getFieldDecorator('album_name', {
                            initialValue: editableItem.album_name,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入专辑名称',
                                },
                            ],
                        })(<Input placeholder="专辑名称" />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="选择歌曲">
                        {getFieldDecorator('songs', {
                            initialValue: editableItem.songs ? editableItem.songs.map(song => song._id) : editableItem.songs,
                            rules: [],
                        })(
                            <Select mode="tags" style={{ width: '100%' }} placeholder="选择歌曲">
                                {audiosOptions}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="专辑描述">
                        {getFieldDecorator('desc', {
                            initialValue: editableItem.desc,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入专辑描述',
                                },
                                {
                                    max: 50,
                                    message: '最多输入50个字！',
                                },
                            ],
                        })(<TextArea placeholder="专辑描述" autosize />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="专辑封面图">
                        {getFieldDecorator('img', {
                            valuePropName: 'file',
                            getValueFromEvent: normFile,
                        })(
                            <Upload.Dragger {...uploadImgProps} data={{ token }}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">拖入文件进行上传</p>
                            </Upload.Dragger>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="标签">
                        {getFieldDecorator('tags', {
                            initialValue: editableItem.tags ? editableItem.tags.map(tag => tag._id) : editableItem.tags,
                            rules: [],
                        })(
                            <Select mode="tags" style={{ width: '100%' }} placeholder="选择标签">
                                {tagsOptions}
                            </Select>
                        )}
                    </FormItem>
                </Form>
            </Card>
        </Modal>
    );
});

@connect(({ albums, audios, tags, qiniu, loading }) => ({
    albums,
    audios,
    tags,
    qiniu,
    loading: loading.models.albums,
}))
@Form.create()
export default class AlbumsList extends PureComponent {
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
            type: 'albums/list',
        });
        dispatch({
            type: 'audios/list',
        });
        dispatch({
            type: 'tags/list',
        });
        dispatch({
            type: 'qiniu/token',
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
            type: 'albums/list',
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
            type: 'albums/list',
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
                type: 'albums/deleteMulti',
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
                type: 'albums/updateMulti',
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
                type: 'albums/updateMulti',
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
                type: 'albums/list',
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
                type: 'albums/create',
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
                type: 'albums/update',
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
            type: 'albums/update',
            payload: item,
        });
    };

    render() {
        const {
            albums: { list: albumsList },
            audios: { list: audiosList },
            tags: { list: tagsList },
            qiniu,
            loading,
        } = this.props;

        const { selectedRows, editable, editableItem, modalVisible } = this.state;

        const columns = [
            {
                title: '专辑名',
                dataIndex: 'album_name',
            },
            {
                title: '封面图',
                dataIndex: 'img',
                render: val => (
                    <img
                        src={`http://${val.url}`}
                        alt=""
                        style={{ width: '50px', height: '50px' }}
                    />
                ),
            },
            {
                title: '描述',
                dataIndex: 'desc',
            },
            {
                title: '歌曲',
                dataIndex: 'songs',
                render: val => {
                    return val.map((song, idx) => {
                        return <p key={idx}>{song.audio_name}</p>;
                    });
                },
            },
            {
                title: '播放次数',
                dataIndex: 'play_times',
            },
            {
                title: '点赞次数',
                dataIndex: 'love_times',
            },
            {
                title: '标签',
                dataIndex: 'tags',
                render: val => {
                    return val.map((tag, idx) => {
                        return <Tag key={idx}>{tag.tag_name}</Tag>;
                    });
                },
            },
            {
                title: '操作',
                render: (text, row, index) => (
                    <Fragment>
                        <a href-void="true" onClick={() => this.editItem(row)}>更新</a>
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
                            data={{ list: albumsList }}
                            columns={columns}
                            onSelectRow={this.handleSelectRows}
                            onChange={this.handleStandardTableChange}
                        />
                    </div>
                </Card>
                <CreateForm
                    {...parentMethods}
                    modalVisible={modalVisible}
                    tags={tagsList}
                    audios={audiosList}
                    qiniu={qiniu}
                    editable={editable}
                    editableItem={editableItem}
                />
            </PageHeaderLayout>
        );
    }
}
