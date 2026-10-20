# TechTicket — Runbook de déploiement

> Ce document permet de reconstruire le serveur de production de zéro.
> ⚠️ Ne jamais y écrire de secret (mot de passe, IP publique, contenu de .env).

## 1. Infrastructure

| Élément | Valeur |
|---|---|
| Fournisseur | OVH (VPS) |
| Système | Ubuntu 26.04 LTS (64 bits) |
| Taille | 2 vCPU / 4 Go RAM / 40 Go SSD |
| Localisation | France> |
| Nom d'hôte | techticket-prod |
| Domaine | <ex. sslip.io ou ton domaine> |
| Date de création | 20/10/2026 |

Accès de secours : console KVM et mode rescue dans l'espace client OVH.

## 2. Prérequis (poste local)

- Clé SSH ed25519 générée : `ssh-keygen -t ed25519 -C "<commentaire>"`
- Clé publique ajoutée au serveur lors de sa création

## 3. Première connexion et mise à jour

```bash
ssh ubuntu@<IP_DU_VPS>
sudo apt update && sudo apt full-upgrade -y
sudo timedatectl set-timezone Europe/Paris
sudo hostnamectl set-hostname techticket-prod
# Redémarrer si /var/run/reboot-required existe
```

## 4. Utilisateur administrateur

```bash
sudo adduser <utilisateur>
sudo usermod -aG sudo <utilisateur>
sudo mkdir -p /home/<utilisateur>/.ssh
sudo cp ~/.ssh/authorized_keys /home/<utilisateur>/.ssh/
sudo chown -R <utilisateur>:<utilisateur> /home/<utilisateur>/.ssh
sudo chmod 700 /home/<utilisateur>/.ssh
sudo chmod 600 /home/<utilisateur>/.ssh/authorized_keys
```

✅ Vérification (nouveau terminal) : `ssh <utilisateur>@<IP_DU_VPS>` puis `sudo whoami` → `root`

## 5. Durcissement SSH

Fichier `/etc/ssh/sshd_config.d/01-hardening.conf` :

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers <utilisateur>
MaxAuthTries 3
X11Forwarding no
```

> Le préfixe `01-` est volontaire : sshd retient la **première** valeur lue,
> et `50-cloud-init.conf` pourrait sinon réactiver les mots de passe.

```bash
sudo sshd -t
sudo systemctl reload ssh
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication|allowusers|maxauthtries'
```

✅ Vérifications (nouveau terminal, sans fermer la session en cours) :
- `ssh <utilisateur>@<IP>` → OK
- `ssh ubuntu@<IP>` → refusé
- `ssh -o PubkeyAuthentication=no <utilisateur>@<IP>` → refusé

## 6. Pare-feu (ufw)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH        # toujours AVANT ufw enable
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

> ⚠️ Docker contourne ufw pour les ports publiés. En production, seul le
> reverse proxy publie des ports (80/443). PostgreSQL et Redis : aucun port publié.

## 7. fail2ban

```bash
sudo apt install -y fail2ban python3-systemd
```

Fichier `/etc/fail2ban/jail.local` :

```ini
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
```

```bash
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

## 8. Mises à jour de sécurité automatiques

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
cat /etc/apt/apt.conf.d/20auto-upgrades   # les deux valeurs doivent être "1"
```

## 9. Docker

Source : documentation officielle « Install Docker Engine on Ubuntu ».

```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Rotation des journaux, fichier `/etc/docker/daemon.json` :

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

```bash
sudo systemctl restart docker
sudo usermod -aG docker <utilisateur>   # puis se reconnecter
docker run --rm hello-world
docker compose version
```

## 10. Vérifications finales du serveur

- [ ] Connexion SSH par clé uniquement, root et mots de passe refusés
- [ ] `ufw status` : 22, 80, 443 uniquement
- [ ] `fail2ban-client status sshd` : jail actif
- [ ] Mises à jour automatiques actives
- [ ] `docker run --rm hello-world` sans sudo

## 11. Déploiement de l'application

_À compléter à l'issue « Premier déploiement »._

## 12. Dépannage

| Problème | Solution |
|---|---|
| Plus d'accès SSH | Console KVM (espace client OVH), corriger `/etc/ssh/sshd_config.d/01-hardening.conf` ou `ufw` |
| IP bannie par fail2ban | Depuis la console : `sudo fail2ban-client set sshd unbanip <IP>` |

## 13. Journal des opérations

| Date | Action | Par |
|---|---|---|
| <JJ/MM/AAAA> | Création et sécurisation du serveur | <toi> |
