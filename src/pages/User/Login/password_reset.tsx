import { Footer } from '@/components';
import { signInWithOtp, setPassword } from '@/services/ant-design-pro/api';
import { FormattedMessage, history } from '@umijs/max';
import { App, ConfigProvider, Spin, Tabs, message, theme } from 'antd';
import { useEffect, useState, type FC } from 'react';
import { Helmet, useIntl, SelectLang } from 'umi';
import Settings from '../../../../config/defaultSettings';
import { ProConfigProvider, ProLayout, LoginForm, ProFormText } from '@ant-design/pro-components';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';


const PasswordSet: FC = () => {
  const [initData, setInitData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const intl = useIntl();
  const [spinning, setSpinning] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();
  const isDarkMode = localStorage.getItem('isDarkMode') === 'true';

  const location = useLocation();
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const accessToken = hashParams.get('access_token');
  const type = hashParams.get('type');

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      setLoading(true);
      const msg = await setPassword(values);
      setLoading(false);
      if (msg.status === 'ok') {
        const defaultResetSuccessMessage = intl.formatMessage({
          id: 'pages.login.password.reset.success',
          defaultMessage: 'Password reset successfully!',
        });
        messageApi.open({
          type: 'success',
          content: defaultResetSuccessMessage,
          duration: 3,
        });
        history.push('/');
        return;
      }
      return;
    } catch (error) {
      const defaultResetFailureMessage = intl.formatMessage({
        id: 'pages.login.password.reset.failure',
        defaultMessage: 'Password reset failed, please try again.',
      });
      messageApi.error(defaultResetFailureMessage);
    }
  };

  useEffect(() => {
    if (spinning && accessToken && type) {
      const body = {
        access_token: accessToken,
        type: type,
      };
      signInWithOtp(body).then((res) => {
        if (res.status === 'error') {
          setSpinning(false);
          return;
        }
        setInitData([
          {
            name: ['email'],
            value: res?.email ?? '',
          },
        ]);
        setSpinning(false);
      });
    }
  }, [spinning, accessToken, type]);

  useEffect(() => {
    setSpinning(true);
  }, []);

  return (
    <App>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: isDarkMode ? '#9e3ffd' : Settings.colorPrimary,
          },
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {contextHolder}
        <ProConfigProvider hashed={false}>
          <ProLayout
            menuRender={false}
            menuHeaderRender={false}
            headerRender={false}
            fixedHeader={false}
            fixSiderbar={false}
          >
            <Helmet>
              <title>
                {intl.formatMessage({
                  id: 'pages.login.passwordReset.title',
                  defaultMessage: 'Reset Password',
                })}
                - {Settings.title}
              </title>
            </Helmet>
            <SelectLang style={{ position: 'absolute', right: 16, top: 16 }} />
            <div style={{ marginTop: '80px' }}>
              <Spin spinning={spinning}>
                <LoginForm
                  layout="vertical"
                  logo={isDarkMode ? 'logo_dark.svg' : Settings.logo}
                  title={<FormattedMessage
                    id="pages.login.title"
                    defaultMessage="TianGong LCA"
                  />}
                  subTitle={<FormattedMessage
                    id="pages.login.subTitle"
                    defaultMessage="TianGong LCA"
                  />}
                  name="password_reset"
                  fields={initData}
                  onFinish={async (values) => {
                    await handleSubmit(values as API.LoginParams);
                  }}
                  submitter={{
                    resetButtonProps: {
                      style: { display: 'none' },
                    },
                    submitButtonProps: {
                      loading: loading,
                    },
                    searchConfig: {
                      submitText: intl.formatMessage({
                        id: 'pages.login.passwordReset.submit',
                        defaultMessage: 'Submit',
                      }),
                    },
                  }}
                >
                  <Tabs
                    centered
                    items={[
                      {
                        key: 'email',
                        label: intl.formatMessage({
                          id: 'pages.login.passwordReset.tab',
                          defaultMessage: 'Reset Password',
                        }),
                      },
                    ]}
                  />
                  <ProFormText
                    name="email"
                    fieldProps={{
                      size: 'middle',
                      prefix: <MailOutlined />,
                    }}
                    placeholder={intl.formatMessage({
                      id: 'pages.login.email.placeholder',
                      defaultMessage: 'Email',
                    })}
                    disabled={true}
                  />
                  <ProFormText.Password
                    name="newPassword"
                    fieldProps={{
                      size: 'middle',
                      prefix: <LockOutlined />,
                      strengthText: <FormattedMessage
                        id="pages.login.password.strengthText"
                        defaultMessage="Password must contain at least 8 characters, including lowercase and uppercase letters, digits, and symbols."
                      />,
                      statusRender: (value) => {
                        const getStatus = () => {
                          if (value && value.length > 12) {
                            return 'ok';
                          }
                          if (value && value.length > 8) {
                            return 'pass';
                          }
                          return 'poor';
                        };
                        const pwdStatus = getStatus();
                        if (pwdStatus === 'pass') {
                          return (
                            <div style={{ color: token.colorWarning }}>
                              <FormattedMessage
                                id="pages.login.password.strengthMedium"
                                defaultMessage="Medium"
                              />
                            </div>
                          );
                        }
                        if (pwdStatus === 'ok') {
                          return (
                            <div style={{ color: token.colorSuccess }}>
                              <FormattedMessage
                                id="pages.login.password.strengthStrong"
                                defaultMessage="Strong"
                              />
                            </div>
                          );
                        }
                        return (
                          <div style={{ color: token.colorError }}>
                            <FormattedMessage
                              id="pages.login.password.strengthWeak"
                              defaultMessage="Weak"
                            />
                          </div>
                        );
                      },
                    }}
                    placeholder={intl.formatMessage({
                      id: 'pages.login.newPassword.placeholder',
                      defaultMessage: 'New password',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.login.password.required"
                            defaultMessage="Please input your password!"
                          />
                        ),
                      },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                        message: (
                          <FormattedMessage
                            id="pages.login.password.validation"
                            defaultMessage="Password is invalid!"
                          />
                        ),
                      },
                    ]}
                    hasFeedback
                  />
                  <ProFormText.Password
                    name="confirmNewPassword"
                    fieldProps={{
                      size: 'middle',
                      prefix: <LockOutlined />,
                    }}
                    dependencies={['newPassword']}
                    hasFeedback
                    placeholder={intl.formatMessage({
                      id: 'pages.login.confirmNewPassword.placeholder',
                      defaultMessage: 'Confirm New Password',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.login.confirmPassword.required"
                            defaultMessage="Please confirm your password!"
                          />
                        ),
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(intl.formatMessage({
                            id: 'pages.login.password.confirm.error',
                            defaultMessage: 'The two passwords do not match!',
                          })));
                        },
                      }),
                    ]}
                  />
                </LoginForm>
              </Spin>
            </div>
            <Footer />
          </ProLayout>
        </ProConfigProvider>
      </ConfigProvider>
    </App>
  );
};

export default PasswordSet;
