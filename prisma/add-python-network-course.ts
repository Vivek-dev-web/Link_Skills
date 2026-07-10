import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding Python Network Automation course…");

  const provider = await prisma.user.findUnique({ where: { email: "liam@atlas.dev" } });
  if (!provider) throw new Error("Provider user liam@atlas.dev not found. Run seed first.");

  const getSkill = async (name: string) => {
    const s = await prisma.skill.findFirst({ where: { name } });
    if (s) return s;
    return prisma.skill.create({ data: { name } });
  };

  const python  = await getSkill("Python");
  const linux   = await getSkill("Linux");
  const docker  = await getSkill("Docker");
  const k8s     = await getSkill("Kubernetes");
  const terraform = await getSkill("Terraform");
  const cicd    = await getSkill("CI/CD");

  const existing = await prisma.course.findFirst({
    where: { title: "Python for Network Automation & Container Orchestration" },
  });
  if (existing) {
    console.log("Course already exists, skipping.");
    return;
  }

  await prisma.course.create({
    data: {
      title: "Python for Network Automation & Container Orchestration",
      level: "ADVANCED",
      creatorId: provider.id,
      providerName: "Liam Chen",
      description:
        "A complete hands-on course for network engineers and DevOps professionals who want to automate infrastructure using Python. You will build and test automation scripts, manage containers with Docker and Kubernetes, set up pod networking with Calico, and implement a production-ready service mesh with Istio.",
      skills: {
        create: [
          { skillId: python.id },
          { skillId: linux.id },
          { skillId: docker.id },
          { skillId: k8s.id },
          { skillId: terraform.id },
          { skillId: cicd.id },
        ],
      },
      modules: {
        create: [
          // ── MODULE 1 ──────────────────────────────────────────
          {
            title: "Python Foundations for Networking",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Why Python dominates network automation",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 8,
                  content:
                    "Network devices speak a dozen different CLIs. Python is the one language that speaks all of them through a consistent set of libraries — Netmiko, Paramiko, Nornir — without caring whether the device on the other end is Cisco, Juniper, or Arista.\n\nThe core reasons:\n- **Readable syntax**: scripts are short, easy to review in a change window\n- **Rich ecosystem**: purpose-built networking libraries exist for almost every vendor\n- **Scriptable glue**: Python connects your NMS, CMDB, and ticket system in a single script\n- **Cross-platform**: runs identically on your laptop, a CI runner, or a network jump host\n\nBy the end of this course you will automate device configuration, orchestrate containers, and build a full service mesh — all from Python.",
                },
                {
                  title: "Data types you'll actually use",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 14,
                  content:
                    "Network automation leans on four Python types above all others.\n\n**Strings** — CLI command templates, IP addresses, interface names.\n```python\ninterface = 'GigabitEthernet0/0'\nip        = '192.168.1.1'\ncmd       = f'interface {interface}\\nip address {ip} 255.255.255.0'\n```\n\n**Lists** — sequences of commands to push, or a fleet of devices to iterate.\n```python\ncommands = ['interface Gi0/0', 'no shutdown', 'exit']\ndevices  = ['10.0.0.1', '10.0.0.2', '10.0.0.3']\n```\n\n**Dictionaries** — the natural shape of a device record or an API response.\n```python\ndevice = {\n  'host': '10.0.0.1',\n  'device_type': 'cisco_ios',\n  'username': 'admin',\n  'password': 'secret',\n}\n```\n\n**Sets** — instant deduplication, perfect for comparing interface lists.\n```python\ncurrent  = {'Gi0/0', 'Gi0/1', 'Gi0/2'}\nexpected = {'Gi0/0', 'Gi0/1'}\nrogue    = current - expected  # {'Gi0/2'} — shut this down!\n```",
                },
                {
                  title: "Loops and functions for fleet operations",
                  type: "TEXT",
                  order: 2,
                  durationMinutes: 12,
                  content:
                    "Every network automation task follows the same loop: connect to a device, do something, close the connection, move to the next device. Python makes this trivially composable.\n\n**For loop over a device list:**\n```python\nfor host in ['10.0.0.1', '10.0.0.2', '10.0.0.3']:\n    push_config(host, commands)\n```\n\n**Functions keep each task clean:**\n```python\ndef push_config(host: str, commands: list[str]) -> str:\n    conn = connect(host)\n    output = conn.send_config_set(commands)\n    conn.disconnect()\n    return output\n```\n\n**Lambda + sorted for quick device ordering:**\n```python\ndevices.sort(key=lambda d: d['priority'], reverse=True)\n```\n\n**Error-safe loop with exception handling:**\n```python\nfor host in devices:\n    try:\n        result = push_config(host, commands)\n        print(f'{host}: OK')\n    except Exception as e:\n        print(f'{host}: FAILED — {e}')\n```",
                },
                {
                  title: "Python Networking Basics — Quiz",
                  type: "QUIZ",
                  order: 3,
                  durationMinutes: 5,
                  content: JSON.stringify({
                    questions: [
                      {
                        question: "Which Python type is best for storing a device record (host, username, password)?",
                        options: ["List", "String", "Dictionary", "Set"],
                        correctIndex: 2,
                      },
                      {
                        question: "What does `current - expected` return when both are sets?",
                        options: ["The union of both sets", "Elements in current that are not in expected", "An error", "Elements common to both"],
                        correctIndex: 1,
                      },
                      {
                        question: "Why is exception handling critical in network automation loops?",
                        options: ["It makes the code run faster", "One unreachable device should not stop the rest from being configured", "Python requires it by default", "It encrypts the connection"],
                        correctIndex: 1,
                      },
                    ],
                  }),
                },
              ],
            },
          },

          // ── MODULE 2 ──────────────────────────────────────────
          {
            title: "File I/O, Modules & Your First Script",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Reading and writing configuration files",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 10,
                  content:
                    "Network configs, host inventories, and output logs all live in files. Python's `open()` and `with` statement handle them cleanly.\n\n**Read a host list from a plain-text file:**\n```python\nwith open('hosts.txt') as f:\n    hosts = [line.strip() for line in f if line.strip()]\n```\n\n**Write command output to a log:**\n```python\nwith open('config_log.txt', 'a') as f:\n    f.write(f'[{host}]\\n{output}\\n\\n')\n```\n\n**Read a YAML inventory (industry standard):**\n```python\nimport yaml\n\nwith open('inventory.yaml') as f:\n    inventory = yaml.safe_load(f)\n\nfor device in inventory['devices']:\n    push_config(device['host'], device['commands'])\n```\n\nThe `with` statement guarantees the file is closed even if an exception is raised — important in scripts that may run for hours.",
                },
                {
                  title: "Structuring scripts with modules and packages",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 10,
                  content:
                    "As your automation library grows, split it into modules so individual tasks stay testable.\n\n```\nautomation/\n├── __init__.py\n├── connect.py    # connection helpers\n├── config.py     # config push/pull\n└── report.py     # output formatting\n```\n\n**connect.py:**\n```python\nfrom netmiko import ConnectHandler\n\ndef get_connection(device: dict):\n    return ConnectHandler(**device)\n```\n\n**Your script imports only what it needs:**\n```python\nfrom automation.connect import get_connection\nfrom automation.config  import backup_config\n\nfor device in devices:\n    conn = get_connection(device)\n    backup_config(conn, device['host'])\n    conn.disconnect()\n```\n\nKeep secrets out of source files. Use `python-dotenv` or environment variables:\n```python\nimport os\npassword = os.environ['NET_PASSWORD']  # never hardcode this\n```",
                },
                {
                  title: "Setting up a virtual environment",
                  type: "TEXT",
                  order: 2,
                  durationMinutes: 8,
                  content:
                    "Virtual environments isolate your project's dependencies from the system Python. Essential when you're running multiple automation projects.\n\n```bash\n# Create\npython3 -m venv netauto\n\n# Activate\nsource netauto/bin/activate       # Linux/macOS\nnnetauto\\Scripts\\activate.bat      # Windows\n\n# Install your dependencies\npip install netmiko nornir paramiko pyyaml python-dotenv\n\n# Freeze for reproducibility\npip freeze > requirements.txt\n\n# Deactivate when done\ndeactivate\n```\n\nCommit `requirements.txt` to version control so teammates or CI can reproduce your environment exactly:\n```bash\npip install -r requirements.txt\n```",
                },
              ],
            },
          },

          // ── MODULE 3 ──────────────────────────────────────────
          {
            title: "Network Automation Libraries in Practice",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Paramiko: SSH connections from Python",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 12,
                  content:
                    "Paramiko is Python's SSH implementation. It gives you low-level control over SSH sessions — useful when you need to work with devices that don't have Netmiko drivers.\n\n**Connect and run a command:**\n```python\nimport paramiko\n\nclient = paramiko.SSHClient()\nclient.set_missing_host_key_policy(paramiko.AutoAddPolicy())\nclient.connect('192.168.1.1', username='admin', password='secret')\n\nstdin, stdout, stderr = client.exec_command('show version')\noutput = stdout.read().decode('utf-8')\nprint(output)\nclient.close()\n```\n\n**Transfer a file with SFTP:**\n```python\nsftp = client.open_sftp()\nsftp.put('new_config.txt', '/flash/new_config.txt')\nsftp.close()\n```\n\nUse Paramiko when you need raw SSH control. For interactive CLI sessions (enable mode, pagination, banners) use Netmiko instead.",
                },
                {
                  title: "Netmiko: multi-vendor SSH made easy",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 14,
                  content:
                    "Netmiko wraps Paramiko and handles the messy parts of network CLI: banners, prompts, pagination, enable mode, and 50+ device drivers.\n\n**Push a configuration change:**\n```python\nfrom netmiko import ConnectHandler\n\ndevice = {\n    'device_type': 'cisco_ios',\n    'host': '192.168.1.1',\n    'username': 'admin',\n    'password': 'secret',\n}\n\nwith ConnectHandler(**device) as conn:\n    conn.enable()  # enter privileged mode\n    output = conn.send_config_set([\n        'interface GigabitEthernet0/1',\n        'description UPLINK-TO-CORE',\n        'no shutdown',\n    ])\n    conn.save_config()\n    print(output)\n```\n\n**Read device output:**\n```python\nwith ConnectHandler(**device) as conn:\n    output = conn.send_command('show ip route')\n    # Netmiko handles pagination automatically\n```\n\nDevices supported: Cisco IOS/IOS-XE/NX-OS/ASA, Juniper JunOS, Arista EOS, Palo Alto, HP/Aruba, and more.",
                },
                {
                  title: "Nornir: parallel automation at scale",
                  type: "TEXT",
                  order: 2,
                  durationMinutes: 14,
                  content:
                    "Netmiko handles one device at a time. Nornir uses Python threading to run tasks against your entire fleet simultaneously.\n\n**hosts.yaml (inventory):**\n```yaml\nrouter1:\n  hostname: 10.0.0.1\n  platform: cisco_ios\n  groups: [core]\n\nrouter2:\n  hostname: 10.0.0.2\n  platform: cisco_ios\n  groups: [core]\n```\n\n**Run a task against all hosts in parallel:**\n```python\nfrom nornir import InitNornir\nfrom nornir_netmiko.tasks import netmiko_send_command\nfrom nornir_utils.plugins.functions import print_result\n\nnr = InitNornir(config_file='config.yaml')\n\nresults = nr.run(\n    task=netmiko_send_command,\n    command_string='show ip interface brief',\n)\nprint_result(results)\n```\n\nNornir runs against all devices concurrently (default: 20 threads). A task that would take 10 minutes sequentially completes in seconds.",
                },
                {
                  title: "Automation Libraries — Quiz",
                  type: "QUIZ",
                  order: 3,
                  durationMinutes: 5,
                  content: JSON.stringify({
                    questions: [
                      {
                        question: "What does Netmiko add on top of Paramiko?",
                        options: [
                          "Encryption support",
                          "Multi-vendor CLI handling including prompts, pagination, and enable mode",
                          "A REST API client",
                          "Container networking",
                        ],
                        correctIndex: 1,
                      },
                      {
                        question: "What is Nornir's key advantage over plain Netmiko scripts?",
                        options: [
                          "It uses a different SSH library",
                          "It supports more vendors",
                          "It runs tasks against the entire inventory in parallel using threading",
                          "It generates YAML configuration files automatically",
                        ],
                        correctIndex: 2,
                      },
                    ],
                  }),
                },
              ],
            },
          },

          // ── MODULE 4 ──────────────────────────────────────────
          {
            title: "Testing, Validating & Configuration Management",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Writing and structuring automation scripts",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 12,
                  content:
                    "A production-ready automation script follows a consistent structure that makes it easy to test and audit.\n\n```python\nimport os\nimport logging\nfrom netmiko import ConnectHandler\n\nlogging.basicConfig(level=logging.INFO, filename='audit.log')\n\nINVENTORY = [\n    {'host': '10.0.0.1', 'device_type': 'cisco_ios',\n     'username': os.environ['NET_USER'], 'password': os.environ['NET_PASS']},\n]\n\nCOMMANDS = [\n    'ntp server 10.0.0.100',\n    'logging 10.0.0.200',\n]\n\ndef apply_baseline(device: dict) -> bool:\n    try:\n        with ConnectHandler(**device) as conn:\n            conn.enable()\n            conn.send_config_set(COMMANDS)\n            conn.save_config()\n            logging.info(f\"{device['host']}: baseline applied\")\n            return True\n    except Exception as e:\n        logging.error(f\"{device['host']}: {e}\")\n        return False\n\nif __name__ == '__main__':\n    results = [apply_baseline(d) for d in INVENTORY]\n    passed  = sum(results)\n    print(f'{passed}/{len(results)} devices updated successfully')\n```\n\nKey principles: credentials from environment variables, structured logging to a file, explicit success/fail count at the end.",
                },
                {
                  title: "Infrastructure as Code with Terraform",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 14,
                  content:
                    "Terraform lets you declare the infrastructure you want, and it figures out what to create, modify, or destroy.\n\n**Provision an EC2 web server (main.tf):**\n```hcl\nprovider \"aws\" {\n  region = \"us-east-1\"\n}\n\nresource \"aws_instance\" \"web\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t3.micro\"\n\n  user_data = <<-EOF\n    #!/bin/bash\n    yum update -y\n    yum install -y httpd\n    systemctl start httpd\n  EOF\n\n  tags = { Name = \"web-server\" }\n}\n\noutput \"public_ip\" {\n  value = aws_instance.web.public_ip\n}\n```\n\n**Workflow:**\n```bash\nterraform init     # download providers\nterraform plan     # preview changes\nterraform apply    # create resources\nterraform destroy  # clean up\n```\n\nCombine Terraform (provision the server) with Python/Netmiko (configure network devices) for full-stack infrastructure automation.",
                },
                {
                  title: "Identifying and fixing non-compliant configurations",
                  type: "TEXT",
                  order: 2,
                  durationMinutes: 12,
                  content:
                    "Compliance checking is automation working in reverse: instead of pushing config, you pull it and compare against a policy.\n\n```python\nimport re\nfrom netmiko import ConnectHandler\n\n# Policy: every interface must have a description\nPOLICY = re.compile(\n    r'^interface (\\S+)\\n(?!\\s+description)',\n    re.MULTILINE,\n)\n\ndef audit_device(device: dict) -> list[str]:\n    with ConnectHandler(**device) as conn:\n        running = conn.send_command('show running-config')\n\n    violations = POLICY.findall(running)\n    return violations  # list of interface names without descriptions\n\ndef remediate(device: dict, interfaces: list[str]):\n    commands = []\n    for iface in interfaces:\n        commands += [f'interface {iface}', 'description AUDIT-PLACEHOLDER']\n\n    with ConnectHandler(**device) as conn:\n        conn.enable()\n        conn.send_config_set(commands)\n        conn.save_config()\n\nfor device in INVENTORY:\n    violations = audit_device(device)\n    if violations:\n        print(f\"{device['host']}: {len(violations)} violations — remediating\")\n        remediate(device, violations)\n    else:\n        print(f\"{device['host']}: compliant\")\n```",
                },
              ],
            },
          },

          // ── MODULE 5 ──────────────────────────────────────────
          {
            title: "Docker & Container Networks",
            order: 4,
            lessons: {
              create: [
                {
                  title: "Containerising a network automation tool",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 12,
                  content:
                    "Packaging your automation scripts in a container makes them reproducible and easy to run in CI/CD.\n\n**Dockerfile:**\n```dockerfile\nFROM python:3.12-slim\n\nWORKDIR /app\n\n# Install dependencies first for layer cache efficiency\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\n# Copy scripts\nCOPY . .\n\n# Default command\nCMD [\"python\", \"run_audit.py\"]\n```\n\n**requirements.txt:**\n```\nnetmiko==4.3.0\nnornir==3.4.1\nnornir-netmiko==1.0.1\npyyaml==6.0.1\npython-dotenv==1.0.0\n```\n\n**Build and run:**\n```bash\ndocker build -t net-audit:latest .\n\ndocker run --rm \\\n  -e NET_USER=$NET_USER \\\n  -e NET_PASS=$NET_PASS \\\n  -v $(pwd)/inventory:/app/inventory \\\n  net-audit:latest\n```\n\nMount the inventory as a volume so you don't have to rebuild the image every time the host list changes.",
                },
                {
                  title: "Container networking and the Docker SDK",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 12,
                  content:
                    "Python's Docker SDK lets you manage containers programmatically — create, start, stop, inspect, and remove, all from a script.\n\n**Install:**\n```bash\npip install docker\n```\n\n**Start a container and stream logs:**\n```python\nimport docker\n\nclient = docker.from_env()\n\ncontainer = client.containers.run(\n    'net-audit:latest',\n    environment={'NET_USER': 'admin', 'NET_PASS': 'secret'},\n    detach=True,\n    remove=True,\n)\n\nfor line in container.logs(stream=True):\n    print(line.decode().strip())\n```\n\n**Create an isolated network for multi-container apps:**\n```python\nnetwork = client.networks.create('automation-net', driver='bridge')\n\njump = client.containers.run('ubuntu', detach=True, network='automation-net')\npyez = client.containers.run('net-audit:latest', detach=True, network='automation-net')\n\n# Containers can reach each other by name on this network\n```\n\nDocker Compose is the easiest way to define multi-container stacks declaratively — see the Docker & Kubernetes course for a deep dive.",
                },
                {
                  title: "Container Networking — Quiz",
                  type: "QUIZ",
                  order: 2,
                  durationMinutes: 5,
                  content: JSON.stringify({
                    questions: [
                      {
                        question: "Why should secrets be passed as environment variables rather than baked into the Docker image?",
                        options: [
                          "Docker doesn't support secrets in the Dockerfile",
                          "Images can be shared or pushed to a registry — baked secrets become publicly visible",
                          "Environment variables are faster at runtime",
                          "It's required by the Docker specification",
                        ],
                        correctIndex: 1,
                      },
                      {
                        question: "What does mounting a volume with `-v $(pwd)/inventory:/app/inventory` accomplish?",
                        options: [
                          "It copies the inventory into the image permanently",
                          "It lets you update the inventory without rebuilding the image",
                          "It encrypts the inventory files",
                          "It creates a backup of the inventory",
                        ],
                        correctIndex: 1,
                      },
                    ],
                  }),
                },
              ],
            },
          },

          // ── MODULE 6 ──────────────────────────────────────────
          {
            title: "Kubernetes & Container Orchestration",
            order: 5,
            lessons: {
              create: [
                {
                  title: "Service discovery with etcd",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 12,
                  content:
                    "etcd is a distributed key-value store that underpins Kubernetes cluster state. You can also use it directly for service discovery in custom automation tooling.\n\n```python\nimport etcd3\n\nclient = etcd3.client(host='localhost', port=2379)\n\n# Register a service endpoint\nclient.put('/services/jump-server', '10.0.0.50:22')\n\n# Discover it from another component\nvalue, metadata = client.get('/services/jump-server')\nprint(f'Jump server is at: {value.decode()}')\n\n# Watch for changes (non-blocking, returns a generator)\nevents, cancel = client.watch('/services/')\nfor event in events:\n    print(f'Service change: {event}')\n    # in production, update routing table here\n    cancel()  # stop watching after first event in this example\n```\n\netcd guarantees strong consistency via the Raft consensus algorithm — every read returns the most recent write, even under node failures.",
                },
                {
                  title: "Automating rolling updates with the Kubernetes SDK",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 14,
                  content:
                    "The Kubernetes Python client lets you manage workloads programmatically — the same operations you'd do with kubectl, but scriptable.\n\n```bash\npip install kubernetes\n```\n\n**Trigger a rolling update by changing the container image:**\n```python\nfrom kubernetes import client, config\n\nconfig.load_kube_config()  # or load_incluster_config() in a pod\n\napps_v1 = client.AppsV1Api()\n\n# Fetch the current deployment\ndeployment = apps_v1.read_namespaced_deployment(\n    name='net-audit', namespace='default'\n)\n\n# Update the image tag\ndeployment.spec.template.spec.containers[0].image = 'net-audit:v2.1.0'\n\n# Apply the change — Kubernetes rolls it out gradually\napps_v1.replace_namespaced_deployment(\n    name='net-audit', namespace='default', body=deployment\n)\nprint('Rolling update initiated')\n```\n\n**Monitor rollout progress:**\n```python\nimport time\n\nwhile True:\n    d = apps_v1.read_namespaced_deployment('net-audit', 'default')\n    ready = d.status.ready_replicas or 0\n    total = d.spec.replicas\n    print(f'{ready}/{total} replicas ready')\n    if ready == total:\n        print('Rollout complete!')\n        break\n    time.sleep(5)\n```",
                },
                {
                  title: "HAProxy load balancing with Python",
                  type: "TEXT",
                  order: 2,
                  durationMinutes: 10,
                  content:
                    "HAProxy manages load balancing for containerised services. Python can automate adding and removing backends as pods come and go.\n\n```python\nimport subprocess\n\nHAPROXY_CFG = '/etc/haproxy/haproxy.cfg'\n\ndef register_backend(ip: str, port: int, name: str):\n    entry = f'  server {name} {ip}:{port} check\\n'\n    with open(HAPROXY_CFG, 'a') as f:\n        f.write(entry)\n    subprocess.run(['systemctl', 'reload', 'haproxy'], check=True)\n    print(f'Registered {name} ({ip}:{port})')\n\ndef deregister_backend(ip: str, port: int):\n    with open(HAPROXY_CFG) as f:\n        lines = f.readlines()\n    lines = [l for l in lines if f'{ip}:{port}' not in l]\n    with open(HAPROXY_CFG, 'w') as f:\n        f.writelines(lines)\n    subprocess.run(['systemctl', 'reload', 'haproxy'], check=True)\n    print(f'Removed {ip}:{port}')\n\n# Hook into Kubernetes pod events to keep HAProxy in sync\nregister_backend('10.0.0.10', 8080, 'web-1')\n```",
                },
              ],
            },
          },

          // ── MODULE 7 ──────────────────────────────────────────
          {
            title: "Kubernetes Pod Networking with Calico",
            order: 6,
            lessons: {
              create: [
                {
                  title: "Pod networking fundamentals",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 10,
                  content:
                    "Every Kubernetes pod gets its own IP address from the cluster's pod CIDR. Pods across different nodes can reach each other directly — no NAT — thanks to the pod network.\n\n**How it works:**\n1. The pod network plugin (Calico, Flannel, Cilium) assigns each node a subnet from the pod CIDR\n2. When a pod starts, it gets an IP from its node's subnet\n3. The plugin sets up routing so packets from any pod can reach any other pod's IP\n4. Kubernetes Services sit on top and give pods a stable DNS name + virtual IP\n\n**Test connectivity between pods:**\n```bash\n# Get pod IPs\nkubectl get pods -o wide\n\n# From inside a pod, ping another pod's IP directly\nkubectl exec -it pod-a -- ping 10.244.1.5\n\n# Or reach a Service by name (DNS handled by CoreDNS)\nkubectl exec -it pod-a -- curl http://my-service:8080\n```\n\nThe key Kubernetes networking rule: every pod can communicate with every other pod without NAT, and every node can communicate with every pod.",
                },
                {
                  title: "Network policies with Calico",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 14,
                  content:
                    "By default, pods can talk to any other pod in the cluster. Calico network policies let you restrict this — only allow what you've explicitly permitted.\n\n**Deny all ingress by default, then allow selectively:**\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all\n  namespace: production\nspec:\n  podSelector: {}       # applies to all pods\n  policyTypes: [Ingress]\n  # no ingress rules = deny everything\n---\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: allow-api-to-db\n  namespace: production\nspec:\n  podSelector:\n    matchLabels:\n      role: database\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          role: api\n    ports:\n    - protocol: TCP\n      port: 5432\n```\n\nApply with kubectl:\n```bash\nkubectl apply -f network-policies.yaml\nkubectl describe networkpolicy allow-api-to-db -n production\n```\n\nCalico also supports GlobalNetworkPolicy for cluster-wide rules, and HostEndpoint policies to protect the node itself.",
                },
                {
                  title: "Pod Networking — Quiz",
                  type: "QUIZ",
                  order: 2,
                  durationMinutes: 5,
                  content: JSON.stringify({
                    questions: [
                      {
                        question: "What does a Kubernetes NetworkPolicy with no ingress rules and `podSelector: {}` accomplish?",
                        options: [
                          "It allows all traffic",
                          "It denies all ingress traffic to all pods in the namespace",
                          "It only affects egress traffic",
                          "It deletes all existing policies",
                        ],
                        correctIndex: 1,
                      },
                      {
                        question: "What is the fundamental Kubernetes networking rule regarding pod-to-pod communication?",
                        options: [
                          "Pods must use a Service to reach other pods",
                          "Pods on the same node can communicate; cross-node requires a VPN",
                          "Every pod can reach every other pod directly without NAT",
                          "Pods communicate through the node's public IP",
                        ],
                        correctIndex: 2,
                      },
                    ],
                  }),
                },
              ],
            },
          },

          // ── MODULE 8 ──────────────────────────────────────────
          {
            title: "Service Mesh with Istio",
            order: 7,
            lessons: {
              create: [
                {
                  title: "Why service mesh — and what Istio does",
                  type: "TEXT",
                  order: 0,
                  durationMinutes: 10,
                  content:
                    "When you have 20 microservices communicating with each other, each service ends up re-implementing the same concerns: retries, timeouts, circuit breaking, mTLS. Service mesh moves all of that out of application code and into the infrastructure.\n\n**Istio's architecture in one sentence:** a sidecar proxy (Envoy) is injected into every pod, and a control plane (istiod) programs all sidecars with your traffic rules.\n\n**What Istio gives you for free:**\n- **mTLS between every service** — encrypted and authenticated, no code changes\n- **Traffic splitting** — send 10% of traffic to a canary version\n- **Retries and circuit breaking** — configure at the mesh level, not per service\n- **Full observability** — every request is traced, latency and error rate metrics are automatic\n- **Fine-grained access control** — only allow service A to call service B on port 8080\n\n**Install Istio:**\n```bash\ncurl -L https://istio.io/downloadIstio | sh -\nexport PATH=$PWD/istio-*/bin:$PATH\nistioctl install --set profile=demo -y\n\n# Enable sidecar injection for a namespace\nkubectl label namespace default istio-injection=enabled\n```",
                },
                {
                  title: "Traffic management: VirtualService and DestinationRule",
                  type: "TEXT",
                  order: 1,
                  durationMinutes: 14,
                  content:
                    "Istio's two core traffic resources work together: VirtualService decides where traffic goes, DestinationRule defines how it gets there.\n\n**Canary deployment — send 5% to v2:**\n```yaml\napiVersion: networking.istio.io/v1beta1\nkind: VirtualService\nmetadata:\n  name: my-api\nspec:\n  hosts: [my-api]\n  http:\n  - route:\n    - destination:\n        host: my-api\n        subset: v1\n      weight: 95\n    - destination:\n        host: my-api\n        subset: v2\n      weight: 5\n---\napiVersion: networking.istio.io/v1beta1\nkind: DestinationRule\nmetadata:\n  name: my-api\nspec:\n  host: my-api\n  subsets:\n  - name: v1\n    labels: { version: v1 }\n  - name: v2\n    labels: { version: v2 }\n```\n\n**Add a retry policy:**\n```yaml\n  http:\n  - retries:\n      attempts: 3\n      perTryTimeout: 2s\n      retryOn: 5xx,reset,connect-failure\n    route:\n    - destination:\n        host: my-api\n```\n\nOnce confident, shift the canary to 100% by changing `weight: 5` to `weight: 100`.",
                },
                {
                  title: "Observability: metrics and traces",
                  type: "TEXT",
                  order: 2,
                  durationMinutes: 12,
                  content:
                    "Istio emits golden signal metrics for every service automatically: request rate, error rate, and latency. No instrumentation required.\n\n**Collect metrics with Prometheus (installed alongside Istio):**\n```bash\n# Port-forward Prometheus\nkubectl -n istio-system port-forward svc/prometheus 9090\n\n# Query: error rate for my-api over the last 5 minutes\nrate(istio_requests_total{destination_service='my-api',response_code!~'2..'}[5m])\n  /\nrate(istio_requests_total{destination_service='my-api'}[5m])\n```\n\n**Visualise with Grafana:**\n```bash\nkubectl -n istio-system port-forward svc/grafana 3000\n# Open http://localhost:3000 → Istio Service Dashboard\n```\n\n**Distributed tracing with Jaeger:**\n```bash\nkubectl -n istio-system port-forward svc/tracing 16686\n# Search for traces by service name\n# Each trace shows the full request path across all microservices\n```\n\nWith Istio's observability stack, you can answer 'what happened?' for any production incident without touching application code.",
                },
                {
                  title: "Service Mesh — Quiz",
                  type: "QUIZ",
                  order: 3,
                  durationMinutes: 5,
                  content: JSON.stringify({
                    questions: [
                      {
                        question: "How does Istio add mTLS between services without requiring code changes?",
                        options: [
                          "It patches the application containers at build time",
                          "It injects a sidecar proxy into each pod that handles encryption transparently",
                          "It uses a network-level firewall to encrypt traffic",
                          "It requires developers to add TLS library calls in each service",
                        ],
                        correctIndex: 1,
                      },
                      {
                        question: "In Istio's canary deployment, what does `weight: 5` on a VirtualService route mean?",
                        options: [
                          "5 requests per second go to that version",
                          "5 replicas of that version are running",
                          "5% of traffic is routed to that destination subset",
                          "The route has a priority of 5",
                        ],
                        correctIndex: 2,
                      },
                      {
                        question: "What are the three golden signals that Istio tracks automatically for every service?",
                        options: [
                          "CPU, memory, and disk",
                          "Request rate, error rate, and latency",
                          "Packet loss, jitter, and throughput",
                          "Pod count, restart count, and OOMKilled events",
                        ],
                        correctIndex: 1,
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅  Python Network Automation course added.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
