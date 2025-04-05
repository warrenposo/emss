
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Smartphone, Send, Clock, Settings, Save, ChevronRight, BellRing, QrCode, RotateCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobilePage = () => {
  const isMobile = useIsMobile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('8f4j9d8s3f4j9d8s3f4j9d8s3f4j9d8s');
  const [smsProvider, setSmsProvider] = useState('twilio');
  const [twilioAccountSid, setTwilioAccountSid] = useState('AC1234567890abcdef1234567890abcdef');
  const [twilioAuthToken, setTwilioAuthToken] = useState('1234567890abcdef1234567890abcdef');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('+12025550123');
  const [smsMessage, setSmsMessage] = useState('Your verification code is: {code}');
  const [smsTestNumber, setSmsTestNumber] = useState('');
  const [androidVersion, setAndroidVersion] = useState('1.2.3');
  const [iosVersion, setIosVersion] = useState('1.2.3');
  const [downloadLink, setDownloadLink] = useState('https://isanda.com/app');
  const [qrCodeLink, setQrCodeLink] = useState('https://isanda.com/app/download');

  const handleSaveSettings = () => {
    toast.success('Mobile settings saved successfully');
  };

  const handleTestSms = () => {
    if (!smsTestNumber) {
      toast.error('Please enter a phone number to test');
      return;
    }

    toast.success(`Test SMS sent to ${smsTestNumber}`);
    setSmsTestNumber('');
  };

  const handleGenerateApiKey = () => {
    // Generate a random API key
    const newApiKey = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    setApiKey(newApiKey);
    toast.success('New API key generated');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mobile App Settings</h1>
          <p className="text-gray-500">Configure mobile app settings, SMS notifications, and API access</p>
        </div>
        <Badge className="bg-green-500">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white mr-1"></div>
            Connected
          </div>
        </Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Smartphone size={16} />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Send size={16} />
            <span>SMS</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings size={16} />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <RotateCw size={16} />
            <span>Versions</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general mobile app settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Enable push notifications for mobile app users
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Location Services</Label>
                  <p className="text-sm text-gray-500">
                    Enable location services for clock-in/out
                  </p>
                </div>
                <Switch
                  checked={locationEnabled}
                  onCheckedChange={setLocationEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Offline Mode</Label>
                  <p className="text-sm text-gray-500">
                    Allow app to function without internet connection
                  </p>
                </div>
                <Switch
                  checked={offlineEnabled}
                  onCheckedChange={setOfflineEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="downloadLink">App Download Link</Label>
                <Input
                  id="downloadLink"
                  value={downloadLink}
                  onChange={(e) => setDownloadLink(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <Label className="mb-2 block">QR Code Download</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-gray-100 flex items-center justify-center border rounded">
                    <QrCode size={100} className="text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="qrCodeLink"
                      value={qrCodeLink}
                      onChange={(e) => setQrCodeLink(e.target.value)}
                      placeholder="QR Code URL"
                    />
                    <Button variant="outline" size="sm">Generate QR Code</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save size={16} />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SMS Settings */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>
                Configure SMS provider and message templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smsProvider">SMS Provider</Label>
                <select
                  id="smsProvider"
                  value={smsProvider}
                  onChange={(e) => setSmsProvider(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="twilio">Twilio</option>
                  <option value="aws-sns">AWS SNS</option>
                  <option value="africastalking">Africa's Talking</option>
                </select>
              </div>

              {smsProvider === 'twilio' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
                    <Input
                      id="twilioAccountSid"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                    <Input
                      id="twilioAuthToken"
                      type="password"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
                    <Input
                      id="twilioPhoneNumber"
                      value={twilioPhoneNumber}
                      onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="smsMessage">SMS Message Template</Label>
                <Input
                  id="smsMessage"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Use {'{code}'} as a placeholder for the verification code
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">Test SMS</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter phone number"
                    value={smsTestNumber}
                    onChange={(e) => setSmsTestNumber(e.target.value)}
                  />
                  <Button onClick={handleTestSms}>Send Test</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save size={16} />
                Save SMS Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API access for mobile applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={handleGenerateApiKey} variant="outline">
                    Generate New
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  This key is used to authenticate API requests from the mobile app
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">API Endpoints</h3>
                <div className="space-y-2">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">GET</span>
                        <span className="ml-2 font-mono text-sm">/api/mobile/attendance</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">POST</span>
                        <span className="ml-2 font-mono text-sm">/api/mobile/check-in</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">POST</span>
                        <span className="ml-2 font-mono text-sm">/api/mobile/check-out</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">PUT</span>
                        <span className="ml-2 font-mono text-sm">/api/mobile/profile</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save size={16} />
                Save API Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Versions Settings */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Versions</CardTitle>
              <CardDescription>
                Manage mobile app versions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xl">A</span>
                    </div>
                    <h3 className="font-medium">Android App</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="androidVersion">Current Version</Label>
                      <Input
                        id="androidVersion"
                        value={androidVersion}
                        onChange={(e) => setAndroidVersion(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="androidMinVersion">Minimum Required Version</Label>
                      <Input
                        id="androidMinVersion"
                        defaultValue="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="androidUpdate">Update URL</Label>
                      <Input
                        id="androidUpdate"
                        defaultValue="https://play.google.com/store/apps/details?id=com.isanda.app"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xl">i</span>
                    </div>
                    <h3 className="font-medium">iOS App</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="iosVersion">Current Version</Label>
                      <Input
                        id="iosVersion"
                        value={iosVersion}
                        onChange={(e) => setIosVersion(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iosMinVersion">Minimum Required Version</Label>
                      <Input
                        id="iosMinVersion"
                        defaultValue="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iosUpdate">Update URL</Label>
                      <Input
                        id="iosUpdate"
                        defaultValue="https://apps.apple.com/app/isanda/id1234567890"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Force Update Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Force Update on Launch</Label>
                      <p className="text-sm text-gray-500">
                        Require users to update the app when a new version is available
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="updateMessage">Update Message</Label>
                    <Input
                      id="updateMessage"
                      defaultValue="A new version of the app is available. Please update to continue using the app."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save size={16} />
                Save Version Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobilePage;
