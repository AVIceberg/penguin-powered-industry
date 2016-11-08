class WelcomeController < ApplicationController

  # GET /welcome
  def index
    if user_is_logged_in?
      redirect_to User.find(session[:id])
    end
  end

  # Attempts to create a session for the user's browser, given the relevant information
  def login
    @user = User.find_by nickname: params[:nickname]
    if @user
      if (@user.is_password?(params[:password]))
        session[:id] = @user.id
        flash[:id]=@user.id
        redirect_to url_for(:controller => :users, :action => :show, id: @user.id)
      else
        redirect_to action: "index", :notice => "Login failed. Invalid password."
        flash[:danger] = "Login failed. Invalid password."
      end
    else

      redirect_to action: "index", :notice => "Login failed. Invalid username."
      flash[:danger] = "Login failed. Invalid username."
    end
  end

  def about
  end
end
