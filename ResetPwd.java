import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class ResetPwd {
  public static void main(String[] args) {
    System.out.print(new BCryptPasswordEncoder().encode(args[0]));
  }
}
