import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import {
    List,
    Card,
    Radio,
    Input,
    Progress,
    Button,
    Icon,
    Dropdown,
    Menu,
    Avatar,
    Modal,
    Select,
    Form,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Notices.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

@connect(({ notices, loading }) => ({
    notices,
    loading: loading.effects['notices/list'],
}))
@Form.create()
export default class NoticesList extends PureComponent {
    state = {
        visible: false,
        confirmLoading: false,
    };

    componentDidMount() {
        this.props.dispatch({
            type: 'notices/list',
        });
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    // 提交公告信息
    submitNotice = () => {
        this.setState({
            confirmLoading: true,
        });
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.props.dispatch({
                    type: 'notices/create',
                    payload: values,
                });
            }
        });
        // setTimeout(() => {
        //   this.setState({
        //     visible: false,
        //     confirmLoading: false,
        //   });
        // }, 2000);
    };
    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        const { notices: { list }, loading } = this.props;
        const { visible, confirmLoading } = this.state;
        const { getFieldDecorator } = this.props.form;

        const extraContent = (
            <div className={styles.extraContent}>
                <RadioGroup defaultValue="all">
                    <RadioButton value="all">全部</RadioButton>
                    <RadioButton value="progress">进行中</RadioButton>
                    <RadioButton value="waiting">等待中</RadioButton>
                </RadioGroup>
                <Search
                    className={styles.extraContentSearch}
                    placeholder="请输入"
                    onSearch={() => ({})}
                />
            </div>
        );

        const paginationProps = {
            showSizeChanger: true,
            showQuickJumper: true,
            pageSize: 5,
            total: 50,
        };

        const ListContent = ({ data: { owner, createdAt, percent, status } }) => (
            <div className={styles.listContent}>
                <div className={styles.listContentItem}>
                    <span>Owner</span>
                    <p>{owner}</p>
                </div>
                <div className={styles.listContentItem}>
                    <span>开始时间</span>
                    <p>{moment(createdAt).format('YYYY-MM-DD HH:mm')}</p>
                </div>
                <div className={styles.listContentItem}>
                    <Progress
                        percent={percent}
                        status={status}
                        strokeWidth={6}
                        style={{ width: 180 }}
                    />
                </div>
            </div>
        );

        const menu = (
            <Menu>
                <Menu.Item>
                    <a>编辑</a>
                </Menu.Item>
                <Menu.Item>
                    <a>删除</a>
                </Menu.Item>
            </Menu>
        );

        const MoreBtn = () => (
            <Dropdown overlay={menu}>
                <a>
                    更多 <Icon type="down" />
                </a>
            </Dropdown>
        );

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

        return (
            <PageHeaderLayout>
                <div className={styles.standardList}>
                    <Card
                        className={styles.listCard}
                        bordered={false}
                        title="公告列表"
                        style={{ marginTop: 24 }}
                        bodyStyle={{ padding: '0 32px 40px 32px' }}
                        extra={extraContent}
                    >
                        <Button
                            type="dashed"
                            onClick={this.showModal}
                            style={{ width: '100%', marginBottom: 8 }}
                            icon="plus"
                        >
                            添加
                        </Button>
                        <Modal
                            title="添加公告"
                            visible={visible}
                            onOk={this.submitNotice}
                            confirmLoading={confirmLoading}
                            onCancel={this.handleCancel}
                            width={1000}
                        >
                            <Card bordered={false}>
                                <Form hideRequiredMark style={{ marginTop: 8 }}>
                                    <FormItem {...formItemLayout} label="公告标题">
                                        {getFieldDecorator('title', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '请输入公告标题',
                                                },
                                            ],
                                        })(<Input placeholder="给目标起个名字" />)}
                                    </FormItem>
                                    <FormItem {...formItemLayout} label="公告信息">
                                        {getFieldDecorator('message', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '请输入公告信息',
                                                },
                                            ],
                                        })(
                                            <TextArea
                                                style={{ minHeight: 32 }}
                                                placeholder="请输入公告信息"
                                                rows={4}
                                            />
                                        )}
                                    </FormItem>

                                    <FormItem
                                        {...formItemLayout}
                                        label="选择品牌类型"
                                        help="选择相关的品牌类型"
                                    >
                                        <div>
                                            <FormItem style={{ marginBottom: 0 }}>
                                                {getFieldDecorator('brand')(
                                                    <Select
                                                        placeholder="品牌类型"
                                                        style={{
                                                            margin: '8px 0',
                                                        }}
                                                    >
                                                        <Option value="1">品牌1</Option>
                                                        <Option value="2">品牌2</Option>
                                                        <Option value="3">品牌3</Option>
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </div>
                                    </FormItem>
                                </Form>
                            </Card>
                        </Modal>
                        <List
                            size="large"
                            rowKey="id"
                            loading={loading}
                            pagination={paginationProps}
                            dataSource={list}
                            renderItem={item => (
                                <List.Item actions={[<a>编辑</a>, <MoreBtn />]}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar src={item.logo} shape="square" size="large" />
                                        }
                                        title={<a href={item.href}>{item.title}</a>}
                                        description={item.subDescription}
                                    />
                                    <ListContent data={item} />
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            </PageHeaderLayout>
        );
    }
}
