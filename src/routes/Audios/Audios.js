import React, { PureComponent, Fragment } from 'react';
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
    DatePicker,
    message,
    Modal,
    Radio,
    Upload,
    Tag,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Audios.less';
import Config from '../../config';

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
        lyrics,
        tags,
        qiniu: { token, domain },
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

            const { img, audio } = newFieldsValue;

            const imgObj = {
                type: img.type,
                name: img.name,
                url: `${domain}/${img.response.hash}`,
                hash: img.response.hash,
                key: img.response.key,
                uid: img.uid,
            };

            const audioObj = {
                type: audio.type,
                name: audio.name,
                url: `${domain}/${audio.response.hash}`,
                hash: audio.response.hash,
                key: audio.response.key,
                uid: audio.uid,
            };

            newFieldsValue = Object.assign(
                newFieldsValue,
                { img: imgObj },
                { audio: audioObj }
            );

            if (editable) {
                newFieldsValue = { ...newFieldsValue, _id: editableItem._id };
                handleUpdate(newFieldsValue)
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

    const lyricOptions = lyrics.map((lyric, idx) => {
        return (
            <Option key={`lyric_option_${idx}`} value={lyric._id}>
                {lyric.audio_name}
            </Option>
        );
    });
    const tagOptions = tags.map((tag, idx) => {
        return (
            <Option key={`tag_option_${idx}`} value={tag._id}>
                {tag.tag_name}
            </Option>
        );
    });

    const action = Config['qiniu-upload-url'];

    const uploadProps = {
        action,
        name: 'file',
        listType: 'picture-card',
        onChange({ file }) {
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

    const uploadImgProps = {
        action,
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

    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.file;
    };

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
                    <FormItem {...formItemLayout} label="类型">
                        {getFieldDecorator('type', {
                            initialValue: editableItem.type,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择音频类型',
                                },
                            ],
                        })(
                            <Radio.Group>
                                <Radio.Button value="song">歌曲</Radio.Button>
                                <Radio.Button value="live_audio">直播音频</Radio.Button>
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="歌曲名称">
                        {getFieldDecorator('audio_name', {
                            initialValue: editableItem.audio_name,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入歌曲名称',
                                },
                            ],
                        })(<Input placeholder="歌曲名称" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="翻唱自">
                        {getFieldDecorator('cover_singer', {
                            initialValue: editableItem.cover_singer,
                            rules: [
                                {
                                    required: true,
                                    message: '翻唱自',
                                },
                            ],
                        })(<Input placeholder="翻唱自" />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="歌唱日期">
                        {getFieldDecorator('sing_date', {
                            initialValue: moment(editableItem.sing_date),
                            rules: [
                                {
                                    required: true,
                                    message: '请输入歌唱日期',
                                },
                            ],
                        })(
                            <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                placeholder="歌唱日期"
                            />
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="歌曲描述">
                        {getFieldDecorator('desc', {
                            initialValue: editableItem.desc,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入歌曲描述',
                                },
                                {
                                    max: 50,
                                    message: '最多输入50个字！',
                                },
                            ],
                        })(<TextArea placeholder="歌曲描述" autosize />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="歌词">
                        {getFieldDecorator('lyrics', {
                            initialValue: editableItem.lyrics,
                            rules: [],
                        })(
                            <Select
                                showSearch
                                placeholder="Select a person"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {lyricOptions}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="标签">
                        {getFieldDecorator('tags', {
                            initialValue: editableItem.tags,
                            rules: [],
                        })(
                            <Select mode="tags" style={{ width: '100%' }} placeholder="选择标签">
                                {tagOptions}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="选择歌曲图片">
                        {getFieldDecorator('img', {
                            initialValue: editableItem.img,
                            valuePropName: 'file',
                            getValueFromEvent: normFile,
                            rules: [
                                {
                                    required: true,
                                    message: '选择歌曲图片',
                                },
                            ],
                        })(
                            // <Upload
                            //     {...uploadImgProps}
                            //     listType="picture-card"
                            //     fileList={imgFileList}
                            //     >
                            //     {imgFileList.length >= 1 ? null : uploadButton}
                            // </Upload>
                            // <Upload
                            //     {...uploadImgProps}
                            //     data={{token}}
                            //     >
                            //     <Button>
                            //     <Icon type="upload" /> Click to Upload
                            //     </Button>
                            // </Upload>
                            <Upload.Dragger {...uploadImgProps} data={{ token }}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">拖入文件进行上传</p>
                            </Upload.Dragger>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="选择歌曲">
                        {getFieldDecorator('audio', {
                            initialValue: editableItem.audio,
                            valuePropName: 'file',
                            getValueFromEvent: normFile,
                            rules: [
                                {
                                    required: true,
                                    message: '选择歌曲',
                                },
                            ],
                        })(
                            <Upload.Dragger {...uploadProps} data={{ token }}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">拖入文件进行上传</p>
                            </Upload.Dragger>
                        )}
                    </FormItem>
                </Form>
            </Card>
        </Modal>
    );
});

@connect(({ audios, lyrics, tags, qiniu, loading }) => ({
    audios,
    lyrics,
    tags,
    qiniu,
    loading: loading.models.audios,
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
            type: 'audios/list',
        });
        dispatch({
            type: 'lyrics/list',
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
            type: 'audios/list',
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
            type: 'audios/list',
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
                type: 'audios/deleteMulti',
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
        default:
            dispatch({
                type: 'audios/updateMulti',
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
                type: 'audios/list',
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
                type: 'audios/create',
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
                type: 'audios/update',
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
            type: 'audios/update',
            payload: item,
        });
    };

    render() {
        const {
            audios: { list: audiosList },
            lyrics: { list: lyricsList },
            tags: { list: tagsList },
            qiniu,
            loading,
        } = this.props;
        const { selectedRows, editable, editableItem, modalVisible } = this.state;
        const columns = [
            {
                title: '类型',
                dataIndex: 'type',
                render: val => (val === 'song' ? '歌曲' : '直播音频'),
            },
            {
                title: '歌曲名',
                dataIndex: 'audio_name',
            },
            {
                title: '歌曲封面',
                dataIndex: 'img',
                render: val => {
                    if (val) {
                        return (
                            <img
                                src={`http://${val.url}`}
                                alt=""
                                style={{ width: '50px', height: '50px', objectFit: "cover" }}
                            />
                        );
                    }
                },
            },
            {
                title: '歌唱日期',
                dataIndex: 'sing_date',
                render: val => moment(val).format('YYYY-MM-DD HH:mm'),
            },
            {
                title: '翻唱自',
                dataIndex: 'cover_singer',
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
                            data={{ list: audiosList }}
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
                    qiniu={qiniu}
                    lyrics={lyricsList}
                    tags={tagsList}
                />
            </PageHeaderLayout>
        );
    }
}
