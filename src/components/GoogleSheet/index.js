import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, Dropdown, Form, Loader, Message } from 'semantic-ui-react';

var gapi = window.gapi || {};

class GoogleSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      isSignedIn: false,
      copying: false,
      spreadSheets: [],
      spreadSheetId: null,
      error: null,
      success: null
    };
    this.init = this.init.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.signIn = this.signIn.bind(this);
    this.onSpreadSheetChange = this.onSpreadSheetChange.bind(this);
    this.copy = this.copy.bind(this);
    this.sampleData = [
      {
        id: 1,
        first_name: 'Jeanette',
        last_name: 'Penddreth',
        email: 'jpenddreth0@census.gov',
        gender: 'Female',
        ip_address: '26.58.193.2'
      },
      {
        id: 2,
        first_name: 'Giavani',
        last_name: 'Frediani',
        email: 'gfrediani1@senate.gov',
        gender: 'Male',
        ip_address: '229.179.4.212'
      },
      {
        id: 3,
        first_name: 'Noell',
        last_name: 'Bea',
        email: 'nbea2@imageshack.us',
        gender: 'Female',
        ip_address: '180.66.162.255'
      },
      {
        id: 4,
        first_name: 'Willard',
        last_name: 'Valek',
        email: 'wvalek3@vk.com',
        gender: 'Male',
        ip_address: '67.76.188.26'
      }
    ];
  }

  async getSpreadSheets() {
    try {
      const data = await gapi.client.drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: `nextPageToken, files(id, name)`
      });
      return data.result.files;
    } catch (e) {
      return e;
    }
  }

  onSpreadSheetChange(e, data) {
    this.setState({
      spreadSheetId: data.value
    });
  }

  async copy() {
    this.setState({
      copying: true
    });
    try {
      // get spreadsheet detail
      const spreadsheet = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: this.state.spreadSheetId
      });

      // append data to sheet 0
      const sheetName = spreadsheet.result.sheets[0].properties.title;

      // parse json data
      const values = _.reduce(
        this.sampleData,
        (result, item, index) => {
          // if (index === 0) {
          //   const titles = Object.keys(item);
          //   result.push(titles);
          // }
          result.push(_.map(item, e => e));
          return result;
        },
        []
      );

      // append data
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.state.spreadSheetId,
        range: sheetName,
        majorDimension: 'ROWS',
        valueInputOption: 'USER_ENTERED',
        values
      });

      this.setState({
        success: true,
        copying: false
      });
    } catch (e) {
      let error = e;
      if (e.result && e.result.error) {
        error = e.result.error;
      }
      this.setState({
        error,
        copying: false
      });
    } finally {
      setTimeout(() => {
        this.setState({
          success: null,
          error: null
        });
      }, 2000);
    }
  }

  signIn() {
    gapi.auth2.getAuthInstance().signIn();
  }

  async updateSigninStatus(isSignedIn) {
    let spreadSheets = [],
      error;
    if (isSignedIn) {
      try {
        spreadSheets = await this.getSpreadSheets();
      } catch (e) {
        error = e;
      }
    }
    this.setState({
      init: true,
      isSignedIn,
      error,
      spreadSheets: spreadSheets.map(({ id, name }) => ({
        key: id,
        text: `${id} (${name})`,
        value: id
      }))
    });
  }

  init() {
    gapi.client
      .init({
        apiKey: this.props.apiKey,
        clientId: this.props.clientId,
        discoveryDocs: [
          'https://sheets.googleapis.com/$discovery/rest?version=v4',
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
        ],
        scope: 'https://www.googleapis.com/auth/drive'
      })
      .then(
        () => {
          gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(this.updateSigninStatus);
          this.updateSigninStatus(
            gapi.auth2.getAuthInstance().isSignedIn.get()
          );
        },
        error => {
          this.setState({
            error
          });
        }
      );
  }

  componentDidMount() {
    if (this.props.apiKey && this.props.clientId) {
      gapi.load('client:auth2', this.init);
    }
  }

  render() {
    const {
      init,
      isSignedIn,
      copying,
      spreadSheets,
      spreadSheetId,
      error,
      success
    } = this.state;

    return (
      <div className="ui centered grid">
        <div className="six wide tablet eight wide computer column">
          <Form>
            <Form.Field>
              <label>Google SpreadSheet Id</label>
              <Dropdown
                selection
                options={spreadSheets}
                onChange={this.onSpreadSheetChange}
              />
            </Form.Field>
            <Form.Field>
              {init && !copying ? (
                isSignedIn ? (
                  <Button primary disabled={!spreadSheetId} onClick={this.copy}>
                    Copy
                  </Button>
                ) : (
                  <Button primary onClick={this.signIn}>
                    Sign In
                  </Button>
                )
              ) : (
                <Loader active inline />
              )}
            </Form.Field>
          </Form>
          {error && <Message error content={error.message} />}
          {success && <Message success content="Success" />}
        </div>
      </div>
    );
  }
}

GoogleSheet.propTypes = {
  apiKey: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired
};

export default GoogleSheet;
