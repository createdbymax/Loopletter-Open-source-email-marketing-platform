import { Metadata } from "next";
import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react";
export const metadata: Metadata = {
    title: "Security - Loopletter",
    description: "Learn about Loopletter's security measures and data protection practices.",
};
export default function SecurityPage() {
    return (<div className="min-h-screen bg-white">
      
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-green-600"/>
            <h1 className="text-4xl font-bold text-gray-900">Security</h1>
          </div>
          <p className="text-xl text-gray-600">
            Your data security and privacy are our top priorities. Learn about the measures we take to protect your information.
          </p>
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-blue-600"/>
              <h2 className="text-3xl font-bold text-gray-900">Data Encryption</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">End-to-End Protection</h3>
              <p className="text-blue-800">
                All data is encrypted both in transit and at rest using industry-standard AES-256 encryption.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">In Transit</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    TLS 1.3 encryption for all connections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    HTTPS enforced across all services
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Certificate pinning for mobile apps
                  </li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">At Rest</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    AES-256 database encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Encrypted file storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Secure key management
                  </li>
                </ul>
              </div>
            </div>
          </section>

          
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-purple-600"/>
              <h2 className="text-3xl font-bold text-gray-900">Access Controls</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Authentication</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Multi-factor authentication (MFA)</li>
                  <li>Strong password requirements</li>
                  <li>Session management</li>
                  <li>Account lockout protection</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Authorization</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Role-based access control</li>
                  <li>Principle of least privilege</li>
                  <li>Regular access reviews</li>
                  <li>Automated deprovisioning</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Monitoring</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Real-time activity logging</li>
                  <li>Anomaly detection</li>
                  <li>Failed login monitoring</li>
                  <li>Audit trail maintenance</li>
                </ul>
              </div>
            </div>
          </section>

          
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-8 h-8 text-green-600"/>
              <h2 className="text-3xl font-bold text-gray-900">Infrastructure Security</h2>
            </div>
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-3">Cloud Security</h3>
              <p className="text-green-800">
                Our infrastructure is hosted on enterprise-grade cloud platforms with SOC 2 Type II compliance.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Network Security</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Virtual private clouds (VPC)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Network segmentation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    DDoS protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Intrusion detection systems
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Server Security</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Regular security updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Hardened server configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    Automated vulnerability scanning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                    24/7 monitoring
                  </li>
                </ul>
              </div>
            </div>
          </section>

          
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance & Certifications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600"/>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">SOC 2 Type II</h4>
                <p className="text-sm text-gray-600">Security, availability, and confidentiality controls</p>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600"/>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">GDPR</h4>
                <p className="text-sm text-gray-600">European data protection regulation compliance</p>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-purple-600"/>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">CCPA</h4>
                <p className="text-sm text-gray-600">California consumer privacy act compliance</p>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600"/>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">CAN-SPAM</h4>
                <p className="text-sm text-gray-600">Email marketing law compliance</p>
              </div>
            </div>
          </section>

          
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Security Practices</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Regular Security Assessments</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Quarterly penetration testing by third-party security firms</li>
                  <li>• Continuous vulnerability scanning and remediation</li>
                  <li>• Annual security audits and compliance reviews</li>
                  <li>• Bug bounty program for responsible disclosure</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Employee Security Training</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Mandatory security awareness training for all employees</li>
                  <li>• Regular phishing simulation exercises</li>
                  <li>• Secure coding practices and code review processes</li>
                  <li>• Background checks for employees with data access</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Incident Response</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• 24/7 security monitoring and alerting</li>
                  <li>• Documented incident response procedures</li>
                  <li>• Regular incident response drills and testing</li>
                  <li>• Transparent communication during security events</li>
                </ul>
              </div>
            </div>
          </section>

          
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Backup & Recovery</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Backup Strategy</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Automated daily backups</li>
                    <li>• Multiple geographic locations</li>
                    <li>• Encrypted backup storage</li>
                    <li>• Regular backup integrity testing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Disaster Recovery</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Recovery time objective (RTO): 4 hours</li>
                    <li>• Recovery point objective (RPO): 1 hour</li>
                    <li>• Automated failover systems</li>
                    <li>• Regular disaster recovery testing</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          
          <section className="bg-red-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Security Issues</h2>
            <p className="text-gray-700 mb-4">
              If you discover a security vulnerability, please report it to us immediately. We appreciate responsible disclosure and will work with you to address any issues.
            </p>
            <div className="space-y-2">
              <p><strong>Security Email:</strong> security@loopletter.co</p>
              <p><strong>PGP Key:</strong> Available upon request</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
          </section>
        </div>
      </div>
    </div>);
}
