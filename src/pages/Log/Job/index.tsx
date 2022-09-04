import React, { useRef } from 'react';

import ProTable from '@ant-design/pro-table';
import { proTableConfigs } from '@/setting';
import { DeleteOutlined, EyeOutlined, FundProjectionScreenOutlined } from '@ant-design/icons';
import { Popconfirm, Button, message, DatePicker, Space } from 'antd';
import { pageQuery, remove, exportExcel } from './service';
import { system, auth } from '@/utils/twelvet';
import type { RequestData } from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer} from '@ant-design/pro-components';
import type { UseFetchDataAction } from '@ant-design/pro-table/lib/useFetchData';

/**
 * 登录日志
 */
const Login: React.FC<{}> = () => {
  const acForm = useRef<ActionType>();

  const formRef = useRef<FormInstance>();

  const { RangePicker } = DatePicker;

  // Form参数
  const columns: ProColumns<LogJob.PageListItem>[] = [
    {
      title: '任务名称',
      ellipsis: true,
      width: 200,
      valueType: 'text',
      dataIndex: 'jobName',
    },
    {
      title: '任务组名',
      width: 200,
      valueType: 'text',
      dataIndex: 'jobGroup',
    },
    {
      title: '调用目标方法',
      width: 200,
      valueType: 'text',
      search: false,
      dataIndex: 'invokeTarget',
    },
    {
      title: '日志信息',
      width: 250,
      valueType: 'text',
      search: false,
      dataIndex: 'jobMessage',
    },
    {
      title: '执行状态',
      ellipsis: false,
      width: 200,
      dataIndex: 'status',
      valueEnum: {
        '0': { text: '成功', status: 'success' },
        '1': { text: '失败', status: 'error' },
      },
    },
    {
      title: '执行时间',
      width: 200,
      valueType: 'text',
      search: false,
      dataIndex: 'createTime',
    },
    {
      title: '执行时间',
      key: 'between',
      hideInTable: true,
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            beginTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
  ];

  /**
   * 移除
   * @param row jobLogIds
   */
  const refRemove = async (
    jobLogIds: (string | number)[] | undefined,
    action: UseFetchDataAction<RequestData<string>>,
  ) => {
    try {
      if (!jobLogIds) {
        return true;
      }
      const { code, msg } = await remove(jobLogIds.join(','));
      if (code != 200) {
        return message.error(msg);
      }

      message.success(msg);

      action.reload();
    } catch (e) {
      system.error(e);
    }
  };

  return (
    <PageContainer>
      <ProTable<LogJob.PageListItem, LogJob.PageParams>
        {...proTableConfigs}
        actionRef={acForm}
        formRef={formRef}
        rowKey="jobLogId"
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await pageQuery(params);
          const { records, total } = data;
          return Promise.resolve({
            data: records,
            success: true,
            total,
          });
        }}
        rowSelection={{}}
        beforeSearchSubmit={(params) => {
          // 分隔搜索参数
          if (params.between) {
            const { between } = params;
            // 移除参数
            delete params.between;

            // 适配参数
            params.beginTime = between[0];
            params.endTime = between[1];
          }
          return params;
        }}
        toolBarRender={(action, { selectedRowKeys }) => [
          <Popconfirm
            disabled={selectedRowKeys && selectedRowKeys.length > 0 ? false : true}
            onConfirm={() => refRemove(selectedRowKeys, action)}
            title="是否删除选中数据"
          >
            <Button
              hidden={auth('system:dict:remove')}
              disabled={selectedRowKeys && selectedRowKeys.length > 0 ? false : true}
              type="primary"
              danger
            >
              <DeleteOutlined />
              批量删除
            </Button>
          </Popconfirm>,
          <Popconfirm
            onConfirm={() => {
              exportExcel({
                ...formRef.current?.getFieldsValue(),
              });
            }}
            title="是否导出数据"
          >
            <Button type="default" hidden={auth('system:dict:export')}>
              <FundProjectionScreenOutlined />
              导出数据
            </Button>
          </Popconfirm>,
          <Popconfirm onConfirm={() => refRemove(selectedRowKeys, action)} title="是否清空">
            <Button type="primary" danger>
              <DeleteOutlined />
              清空
            </Button>
          </Popconfirm>,
        ]}
      />
    </PageContainer>
  );
};

export default Login;
