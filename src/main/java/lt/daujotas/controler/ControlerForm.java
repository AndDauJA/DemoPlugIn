package lt.daujotas.controler;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ControlerForm {


    @GetMapping("/")
    public String getFormFromCreate(){


       return "form";
    }
}
