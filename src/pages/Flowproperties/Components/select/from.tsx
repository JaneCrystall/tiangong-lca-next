import { getFlowpropertyDetail } from '@/services/flowproperties/api';
import { genFlowpropertyFromData } from '@/services/flowproperties/util';
import { ProFormInstance } from '@ant-design/pro-components';
import { Button, Card, Col, Divider, Form, Input, Row, Space } from 'antd';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { FormattedMessage } from 'umi';
import FlowpropertyView from '../view';
import FlowpropertiesSelectDrawer from './drawer';
// import LangTextItemFrom from '@/components/LangTextItem/from';
const { TextArea } = Input;

type Props = {
  name: any;
  label: ReactNode | string;
  lang: string;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
  onData: () => void;
};

const FlowpropertiesSelectFrom: FC<Props> = ({ name, label, lang, formRef, onData }) => {
  const [id, setId] = useState<string | undefined>(undefined);

  const handletFlowpropertyData = (rowKey: any) => {
    getFlowpropertyDetail(rowKey).then(async (result: any) => {
      const selectedData = genFlowpropertyFromData(result.data?.json?.flowPropertyDataSet ?? {});
      await formRef.current?.setFieldValue(name, {
        '@refObjectId': `${rowKey}`,
        '@type': 'flow property data set',
        '@uri': `../flowproperties/${rowKey}.xml`,
        'common:shortDescription':
          selectedData?.flowPropertiesInformation?.dataSetInformation?.['common:name'] ?? [],
      });
      onData();
    });
  };

  useEffect(() => {
    setId(formRef.current?.getFieldValue([...name, '@refObjectId']));
  });

  return (
    <Card size="small" title={label}>
      <Space direction="horizontal">
        <Form.Item label="Ref Object Id" name={[...name, '@refObjectId']}>
          <Input disabled={true} style={{ width: '350px', color: '#000' }} />
        </Form.Item>
        <Space direction="horizontal" style={{ marginTop: '6px' }}>
          <FlowpropertiesSelectDrawer
            buttonType="text"
            lang={lang}
            onData={handletFlowpropertyData}
          />
          {id && <FlowpropertyView lang={lang} id={id} buttonType="text" />}
          {id && (
            <Button
              onClick={() => {
                formRef.current?.setFieldValue([...name], {});
                onData();
              }}
            >
              <FormattedMessage id="pages.button.clear" defaultMessage="Clear" />
            </Button>
          )}
        </Space>
      </Space>
      <Form.Item label="Type" name={[...name, '@type']}>
        <Input disabled={true} style={{ color: '#000' }} />
      </Form.Item>
      <Form.Item label="URI" name={[...name, '@uri']}>
        <Input disabled={true} style={{ color: '#000' }} />
      </Form.Item>
      {/* <Form.Item label="Version" name={[...name, '@version']}>
        <Input disabled={true} />
      </Form.Item> */}
      <Divider orientationMargin="0" orientation="left" plain>
        Short Description
      </Divider>
      {/* <LangTextItemFrom
        name={[...name, 'common:shortDescription']}
        label="Short Description"
      /> */}
      <Form.Item>
        <Form.List name={[...name, 'common:shortDescription']}>
          {(subFields) => (
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
              {subFields.map((subField) => (
                <Row key={subField.key}>
                  <Col flex="100px" style={{ marginRight: '10px' }}>
                    <Form.Item noStyle name={[subField.name, '@xml:lang']}>
                      <Input disabled={true} style={{ width: '100px', color: '#000' }} />
                    </Form.Item>
                  </Col>
                  <Col flex="auto" style={{ marginRight: '10px' }}>
                    <Form.Item noStyle name={[subField.name, '#text']}>
                      <TextArea
                        placeholder="text"
                        rows={1}
                        disabled={true}
                        style={{ color: '#000' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              {subFields.length < 1 && <Input disabled={true} />}
            </div>
          )}
        </Form.List>
      </Form.Item>
    </Card>
  );
};

export default FlowpropertiesSelectFrom;
